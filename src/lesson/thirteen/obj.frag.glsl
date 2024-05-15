#version 300 es

precision highp float;

struct Material {
    sampler2D diffuse;
    sampler2D specular;
    float shininess;
};
uniform Material material;

struct PointLight {
    vec3 position;

    float constant;
    float linear;
    float quadratic;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

struct DirectionLight {
    vec3 direction;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};
uniform DirectionLight direction_light;

struct SpotLight {
    float constant;
    float linear;
    float quadratic;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;

    float cutOff;
    float outCutOff;
};
uniform SpotLight spot_light;

#define NR_POINT_LIGHTS 4
uniform PointLight point_lights[NR_POINT_LIGHTS];
uniform vec3 camera_position;
uniform vec3 camera_direction;

in vec3 a_normal;
in vec3 a_frag_position;
in vec2 a_texcoord;
out vec4 out_color;

vec3 calcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir) {
    vec3 lightDir = normalize(light.position - fragPos);
    float diff = max(dot(normal, lightDir), 0.0f);

    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0f), material.shininess);

    vec3 ambient = light.ambient * vec3(texture(material.diffuse, a_texcoord));
    vec3 diffuse = light.diffuse * diff * vec3(texture(material.diffuse, a_texcoord));
    vec3 specular = light.specular * spec * vec3(texture(material.specular, a_texcoord));

    float distance = length(light.position - fragPos);
    float attenuation = 1.0f / (light.constant + light.linear * distance + light.quadratic * distance * distance);

    return (ambient + diffuse + specular) * attenuation;
}

vec3 calcDirectionLight(DirectionLight light, vec3 normal, vec3 fragPos, vec3 viewDir) {
    vec3 lightDir = normalize(-light.direction);
    float diff = max(dot(normal, lightDir), 0.0f);

    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0f), material.shininess);

    vec3 ambient = light.ambient * vec3(texture(material.diffuse, a_texcoord));
    vec3 diffuse = light.diffuse * diff * vec3(texture(material.diffuse, a_texcoord));
    vec3 specular = light.specular * spec * vec3(texture(material.specular, a_texcoord));

    return (ambient + diffuse + specular);
}

vec3 calcSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir) {
    vec3 lightDir = normalize(camera_position - fragPos);
    float diff = max(dot(lightDir, normal), 0.0);

    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(reflectDir, normal), 0.0), material.shininess);

    float distance = length(camera_position - fragPos);
    float attenuation = 1.0f / (light.constant + light.linear * distance + light.quadratic * distance * distance);

    float theta = dot(-lightDir, normalize(camera_direction));
    float epsilon = light.cutOff - light.outCutOff;
    float intensity = clamp((theta - light.outCutOff) / epsilon, 0.0, 1.0);

    vec3 ambient = light.ambient * vec3(texture(material.diffuse, a_texcoord));
    vec3 diffuse = light.diffuse * diff * vec3(texture(material.diffuse, a_texcoord));
    vec3 specular = light.specular * spec * vec3(texture(material.specular, a_texcoord));

    ambient = ambient * attenuation * intensity;
    diffuse = diffuse * attenuation * intensity;
    specular = specular * attenuation * intensity;

    return ambient + diffuse + specular;
}

void main() {

    vec3 normal = normalize(a_normal);
    vec3 viewDir = normalize(camera_position - a_frag_position);
    vec3 color = calcDirectionLight(direction_light, normal, a_frag_position, viewDir);

    for(int i = 0; i < NR_POINT_LIGHTS; i++) {
        PointLight light = point_lights[i];
        color += calcPointLight(light, normal, a_frag_position, viewDir);
    }
    color += calcSpotLight(spot_light, a_normal, a_frag_position, viewDir);
    out_color = vec4(color, 1);
}
