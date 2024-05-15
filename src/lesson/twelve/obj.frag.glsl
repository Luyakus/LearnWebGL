#version 300 es

precision highp float;

struct Material {
    sampler2D diffuse;
    sampler2D specular;
    float shininess;
};
uniform Material material;

struct Light {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float constant;
    float linear;
    float quadratic;
    float cutOff;
    float outCutOff;
};

uniform Light light;

uniform vec3 v_camera_position;
uniform vec3 v_camera_front;

in vec3 a_normal;
in vec3 a_frag_position;
in vec2 a_texcoord;
out vec4 out_color;

void main() {

    vec3 norm = normalize(a_normal);
    vec3 light_dir = normalize(v_camera_position - a_frag_position);
    float angle = dot(light_dir, -v_camera_front);

    vec3 ambient_color = texture(material.diffuse, a_texcoord).rgb * light.ambient;

    float diff = max(dot(norm, light_dir), 0.0f);
    vec3 diff_color = diff * texture(material.diffuse, a_texcoord).rgb * light.diffuse;

    vec3 view_dir = normalize(v_camera_position - a_frag_position);
    vec3 reflect_dir = reflect(-light_dir, norm);
    float spec = pow(max(dot(view_dir, reflect_dir), 0.0f), material.shininess);
    vec3 spec_color = spec * texture(material.specular, a_texcoord).rgb * light.specular;

    float intensity = clamp((angle - light.outCutOff) / (light.cutOff - light.outCutOff), 0.0, 1.0);

    float distance = length(v_camera_position - a_frag_position);
    float attenuation = 1.0;// 1.0f / (light.constant + light.linear * distance + light.quadratic * distance * distance);

    vec3 color = ambient_color + diff_color * intensity * attenuation + spec_color * intensity * attenuation;

    out_color = vec4(color, 1);
}
