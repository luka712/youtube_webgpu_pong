struct VSInput 
{
    @location(0) position: vec3f, 
}

struct VSOutput {
    @builtin(position) position: vec4f,
}

@group(0) @binding(0)
var<uniform> transforms: array<mat4x4f, 1>;

@group(1) @binding(0)
var<uniform> projectionView: mat4x4f;

@vertex 
fn shadowVS(
    in: VSInput,

    // builtins 
    @builtin(instance_index) iid: u32, 
) -> VSOutput
{
    var out : VSOutput;
    out.position = projectionView * transforms[iid] * vec4f(in.position, 1.0);
    return out;
}