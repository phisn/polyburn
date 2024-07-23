export function Ticks(props: { value: number; className?: string }) {
    return <div className={props.className}>{ticksToMMSS(props.value)}</div>
}

export const ticksToMMSS = (ticks: number) => secondsToMMSS((ticks * 100) / 6)

export const secondsToMMSS = (seconds: number) => {
    const HH = `${Math.floor(seconds / (1000 * 60))}`.padStart(2, "0")
    const MM = `${Math.floor(seconds / 1000) % 60}`.padStart(2, "0")
    const SS = `${Math.floor(seconds % 1000)}`.padStart(3, "0")
    return [HH, MM, SS].join(":")
}
