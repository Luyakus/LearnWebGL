#version 300 es

precision highp float;

uniform vec3 obj_color;
uniform vec3 light_color;
uniform vec3 v_light_position;
uniform vec3 v_camera_position;

in vec3 a_normal;
in vec3 a_frag_position;

out vec4 out_color;

void main() {
    vec3 norm = normalize(a_normal);
    vec3 light_dir = normalize(v_light_position - a_frag_position);
    float diff = max(dot(norm, light_dir), 0.0);
    vec3 diff_color = diff * light_color;

    float ambient_strength = 0.2;
    vec3 ambient_color = light_color * ambient_strength;

    vec3 view_dir = normalize(v_camera_position - a_frag_position);
    vec3 reflect_dir = reflect(-light_dir, norm);
    float spec = pow(max(dot(view_dir, reflect_dir), 0.0), 32.0);
    float spec_strength = 0.9;
    vec3 spec_color = spec_strength * spec * light_color;
    

    vec3 color = ambient_color + diff_color + spec_color;
    out_color = vec4(obj_color * color, 1);
}
