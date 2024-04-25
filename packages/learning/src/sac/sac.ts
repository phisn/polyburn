import * as tf from "@tensorflow/tfjs"
import { ActivationIdentifier } from "@tensorflow/tfjs-layers/dist/keras_format/activation_config"

const LOG_STD_MIN = -20
const LOG_STD_MAX = 2

function mlp(
    x: tf.Tensor2D,
    hiddenSizes: number[],
    activation: ActivationIdentifier,
    outputActivation: ActivationIdentifier | undefined,
) {
    for (const h of hiddenSizes) {
        x = tf.layers
            .dense({
                units: h,
                activation,
            })
            .apply(x) as tf.Tensor2D
    }

    return tf.layers
        .dense({
            units: 1,
            activation: outputActivation,
        })
        .apply(x) as tf.Tensor2D
}

/*
def gaussian_likelihood(x, mu, log_std):
    pre_sum = -0.5 * (((x-mu)/(tf.exp(log_std)+EPS))**2 + 2*log_std + np.log(2*np.pi))
    return tf.reduce_sum(pre_sum, axis=1)
*/

function gaussianLikelihood(x: tf.Tensor2D, mu: tf.Tensor2D, logstd: tf.Tensor2D) {
    const preSum = tf.mul(
        -0.5,
        tf.add(
            tf.pow(tf.div(tf.sub(x, mu), tf.exp(logstd)), 2),
            tf.add(tf.mul(2, logstd), Math.log(2 * Math.PI)),
        ),
    )

    return tf.sum(preSum, 1)
}

function mlpGaussianPolicy(
    x: tf.Tensor2D,
    a: tf.Tensor2D,
    hiddenSizes: number[],
    activation: ActivationIdentifier,
    outputActivation: ActivationIdentifier,
) {
    const actionDimension = a.shape[1]

    const network = mlp(x, hiddenSizes, activation, outputActivation)
    const mu = tf.layers
        .dense({
            units: actionDimension,
            activation: "tanh",
        })
        .apply(network) as tf.Tensor2D

    const logstd = tf.layers
        .dense({
            units: actionDimension,
        })
        .apply(network) as tf.Tensor2D

    const logstdClipped = tf.clipByValue(logstd, LOG_STD_MIN, LOG_STD_MAX)

    const std = tf.exp(logstdClipped)
    const pi = tf.add(mu, tf.mul(tf.randomNormal(std.shape), std))
    const logPi = gaussianLikelihood(a, mu, logstdClipped)

    return {
        mu: mu as tf.Tensor2D,
        pi: pi as tf.Tensor2D,
        logPi: logPi as tf.Tensor2D,
    }
}

/*
def apply_squashing_func(mu, pi, logp_pi):
    # Adjustment to log prob
    # NOTE: This formula is a little bit magic. To get an understanding of where it
    # comes from, check out the original SAC paper (arXiv 1801.01290) and look in
    # appendix C. This is a more numerically-stable equivalent to Eq 21.
    # Try deriving it yourself as a (very difficult) exercise. :)
    logp_pi -= tf.reduce_sum(2*(np.log(2) - pi - tf.nn.softplus(-2*pi)), axis=1)

    # Squash those unbounded actions!
    mu = tf.tanh(mu)
    pi = tf.tanh(pi)
    return mu, pi, logp_pi

*/

function applySquashingFunction(mu: tf.Tensor2D, pi: tf.Tensor2D, logPi: tf.Tensor2D) {
    logPi = tf.sub(
        logPi,
        tf.sum(tf.mul(2, tf.sub(tf.sub(Math.log(2), pi), tf.softplus(tf.mul(-2, pi)))), 1),
    )

    mu = tf.tanh(mu)
    pi = tf.tanh(pi)

    return { mu, pi, logPi }
}

/*
    # policy
    with tf.variable_scope('pi'):
        mu, pi, logp_pi = policy(x, a, hidden_sizes, activation, output_activation)
        mu, pi, logp_pi = apply_squashing_func(mu, pi, logp_pi)

    # make sure actions are in correct range
    action_scale = action_space.high[0]
    mu *= action_scale
    pi *= action_scale

    # vfs
    vf_mlp = lambda x : tf.squeeze(mlp(x, list(hidden_sizes)+[1], activation, None), axis=1)
    with tf.variable_scope('q1'):
        q1 = vf_mlp(tf.concat([x,a], axis=-1))
    with tf.variable_scope('q2'):
        q2 = vf_mlp(tf.concat([x,a], axis=-1))
    return mu, pi, logp_pi, q1, q2
*/

function mlpActorCritic(
    x: tf.Tensor2D,
    a: tf.Tensor2D,
    hiddenSizes: number[],
    activation: ActivationIdentifier,
    outputActivation: ActivationIdentifier,
    policy: typeof mlpGaussianPolicy,
    actionSpace: number,
) {
    const { mu, pi, logPi } = policy(x, a, hiddenSizes, activation, outputActivation)
    const {
        mu: muSquashed,
        pi: piSquashed,
        logPi: logPiSquashed,
    } = applySquashingFunction(mu, pi, logPi)

    const actionScale = actionSpace
    const muScaled = tf.mul(muSquashed, actionScale)
    const piScaled = tf.mul(piSquashed, actionScale)

    const vfMlp = (x: tf.Tensor2D) =>
        tf.squeeze(mlp(x, [...hiddenSizes, 1], activation, undefined), [1])

    const q1 = vfMlp(tf.concat([x, a], 1))
    const q2 = vfMlp(tf.concat([x, a], 1))

    return { mu: muScaled, pi: piScaled, logPi: logPiSquashed, q1, q2 }
}
