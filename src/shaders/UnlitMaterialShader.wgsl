struct VSOutput {
    @builtin(position) position: vec4f 
}

@vertex 
fn unlitMaterialVS(
    @builtin(vertex_index) vid: u32 
) -> VSOutput
{
    var position : array<vec4f, 3> = array(
        vec4f(-0.5, -0.5, 0.0, 1.0), // 0
        vec4f(-0.5, 0.5, 0.0, 1.0), // 1 
        vec4f(0.5, -0.5, 0.0, 1.0)  // 2
    );

    var out : VSOutput;
    out.position = position[vid];

    return out;
}

@fragment
fn unlitMaterialFS() -> @location(0) vec4f
{
    return vec4f(0.0, 1.0, 0.0, 1.0);
}