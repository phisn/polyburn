use std::io::Result;

fn main() -> Result<()> {
    prost_build::compile_protos(&["src/world.proto", "src/replay.proto"], &["src/"])?;
    Ok(())
}
