precision lowp float;

uniform vec2 iResolution;
uniform sampler2D texture;
uniform float iTime;

float PHI = 1.61803398874989484820459;  // Φ = Golden Ratio   
float PI = 3.1415926535;

float gold_noise(vec2 xy, float seed){
       return fract(tan(distance(xy*PHI, xy)*seed)*xy.x);
}

void main(void) {

    vec2 r = iResolution;

    vec2 xy = gl_FragCoord.xy;
    
    float sum = 0.0;
    vec4 color = vec4(0.0);

    float seed = fract(iTime);
    int pos = int(xy.x);
    int len = int(gold_noise(xy, seed) * 21.0);
    
    bool dark = gold_noise(xy, seed - 1.0) < 0.1;

    for (int i = 0; i < 20; i++) {
        if (i > pos || i > len) {
            break;
        }
        float ifl = float(i);
        vec2 cxy = vec2(xy.x - ifl, xy.y);
        vec2 cuv = cxy / r;
        
        float noise = gold_noise(cxy, seed + ifl / 10.0);

        vec4 curcolor = texture2D(texture, cuv);
        if (noise < 0.1) {
            curcolor.yx = curcolor.xy;
        }

        if (dark) {
            curcolor /= 5.0;
        }

        color += curcolor * noise / exp(ifl * float(20 - len));
        sum += noise / exp(ifl * float(20 - len));
    }

    gl_FragColor = color / sum;
}
