#version 300 es

precision highp float;

struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;
};
uniform Material material;

struct Light {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

uniform Light light;

uniform vec3 obj_color;
uniform vec3 light_color;
uniform vec3 v_light_position;
uniform vec3 v_camera_position;

in vec3 a_normal;
in vec3 a_frag_position;

out vec4 out_color;

void main() {
    vec3 ambient_color = material.ambient * light.ambient * light_color;

    vec3 norm = normalize(a_normal);
    vec3 light_dir = normalize(v_light_position - a_frag_position);
    float diff = max(dot(norm, light_dir), 0.0f);
    vec3 diff_color = diff * material.diffuse * light.diffuse * light_color;

    vec3 view_dir = normalize(v_camera_position - a_frag_position);
    vec3 reflect_dir = reflect(-light_dir, norm);
    float spec = pow(max(dot(view_dir, reflect_dir), 0.0f), material.shininess);
    vec3 spec_color = spec * material.specular * light.specular * light_color;

    vec3 color = ambient_color + diff_color + spec_color;
    out_color = vec4(obj_color * color, 1);
}
