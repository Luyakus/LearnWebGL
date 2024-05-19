#version 300 es

precision highp float;

uniform sampler2D dif_texture;
uniform sampler2D spec_texture;
uniform float shininess;

struct Light {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    vec3 direction;
};

uniform Light light;
uniform vec3 camera_position;

in vec2 a_texcoord;
in vec3 a_normal;
in vec3 a_frag_position;
out vec4 out_color;

void main() {
    vec3 ambient_color = texture(dif_texture, a_texcoord).rgb * light.ambient;

    vec3 norm = normalize(a_normal);
    vec3 light_dir = normalize(-light.direction);
    float diff = max(dot(norm, light_dir), 0.0f);
    vec3 diff_color = diff * texture(dif_texture, a_texcoord).rgb * light.diffuse;

    vec3 view_dir = normalize(camera_position - a_frag_position);
    vec3 reflect_dir = reflect(-light_dir, norm);
    float spec = pow(max(dot(view_dir, reflect_dir), 0.0f), shininess);
    vec3 spec_color = spec * texture(spec_texture, a_texcoord).rgb * light.specular;

    vec3 color = ambient_color + diff_color + spec_color;
    out_color = vec4(color, 1);
}
