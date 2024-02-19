struct VSInput 
{
    @location(0) position: vec3f, 
    @location(1) color: vec4f, 
    @location(2) texCoord: vec2f,
    @location(3) normal: vec3f,
}

struct VSOutput {
    @builtin(position) position: vec4f,
    @location(1) color: vec4f,
    @location(2) texCoord: vec2f,
    @location(3) normal: vec3f,
}

@group(0) @binding(0)
var<uniform> transforms: array<mat4x4f, 1>;

@group(0) @binding(1)
var<uniform> textureTilling: vec2f;

@group(1) @binding(0)
var<uniform> projectionView: mat4x4f;

@vertex 
fn unlitMaterialVS(
    in: VSInput,

    // builtins 
    @builtin(vertex_index) vid: u32,  
    @builtin(instance_index) iid: u32, 
) -> VSOutput
{
    var out : VSOutput;
    out.position = projectionView * transforms[iid] * vec4f(in.position, 1.0);
    out.color = in.color;
    out.texCoord = in.texCoord * textureTilling;
    out.normal = normalize(in.normal);

    return out;
}

struct AmbientLight 
{
    @location(0) color: vec3f,
    @location(1) intensity: f32,
};

struct DirectionalLight 
{
    @location(0) color: vec3f,
    @location(1) intensity: f32,
    @location(2) direction: vec3f,
};

@group(2) @binding(0)
var diffuseTexture: texture_2d<f32>;
@group(2) @binding(1)
var diffuseTexSampler: sampler;
@group(2) @binding(2)
var<uniform> diffuseColor: vec4f;

@group(3) @binding(0)
var<uniform> ambientLight: AmbientLight;
@group(3) @binding(1)
var<uniform> directionalLight: DirectionalLight;

@fragment
fn unlitMaterialFS(in : VSOutput) -> @location(0) vec4f
{
    var diffuseColor = textureSample(diffuseTexture, diffuseTexSampler, in.texCoord) * in.color * diffuseColor;

    // Ambient
    var lightAmount: vec3f = ambientLight.color * ambientLight.intensity;

    // Directional
    var lightDir = normalize(-directionalLight.direction);
    var dotProduct = dot(in.normal, lightDir);
    lightAmount += clamp(dotProduct, 0, 1) * directionalLight.color * directionalLight.intensity;


    return vec4f(diffuseColor.rgb * lightAmount, diffuseColor.a);
}