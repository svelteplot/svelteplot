import type { GeoProjection } from 'd3-geo';
import {
    geoAlbers,
    geoAlbersUsa,
    geoAzimuthalEqualArea,
    geoAzimuthalEquidistant,
    geoConicConformal,
    geoConicEqualArea,
    geoConicEquidistant,
    geoEqualEarth,
    geoEquirectangular,
    geoGnomonic,
    geoMercator,
    geoOrthographic,
    geoStereographic,
    geoTransverseMercator,
    geoTransform
} from 'd3-geo';
import { constant } from './index.js';

const identity = constant({ stream: (stream: any) => stream });

const reflectY = constant({
    ...geoTransform({
        point(x: number, y: number) {
            this.stream.point(x, -y);
        }
    }),
    invert(x: number, y: number) {
        return [x, -y];
    }
});

const pi = Math.PI;
const tau = 2 * pi;

type ProjectionInitializer = () => GeoProjection;

type ProjectionOptions = {
    width: number;
    height: number;
    rotate?: [number, number] | [number, number, number];
    precision?: number;
    clip?: number | null;
    parallels?: [number, number];
    domain?: any;
};

export function namedProjection(projection: string) {
    switch (`${projection}`.toLowerCase()) {
        case 'albers-usa':
            return scaleProjection(geoAlbersUsa, 0.7463, 0.4673);
        case 'albers':
            return conicProjection(geoAlbers, 0.7463, 0.4673);
        case 'azimuthal-equal-area':
            return scaleProjection(geoAzimuthalEqualArea, 4, 4);
        case 'azimuthal-equidistant':
            return scaleProjection(geoAzimuthalEquidistant, tau, tau);
        case 'conic-conformal':
            return conicProjection(geoConicConformal, tau, tau);
        case 'conic-equal-area':
            return conicProjection(geoConicEqualArea, 6.1702, 2.9781);
        case 'conic-equidistant':
            return conicProjection(geoConicEquidistant, 7.312, 3.6282);
        case 'equal-earth':
            return scaleProjection(geoEqualEarth, 5.4133, 2.6347);
        case 'equirectangular':
            return scaleProjection(geoEquirectangular, tau, pi);
        case 'gnomonic':
            return scaleProjection(geoGnomonic, 3.4641, 3.4641);
        case 'identity':
            return { type: identity };
        case 'reflect-y':
            return { type: reflectY };
        case 'mercator':
            return scaleProjection(geoMercator, tau, tau);
        case 'orthographic':
            return scaleProjection(geoOrthographic, 2, 2);
        case 'stereographic':
            return scaleProjection(geoStereographic, 2, 2);
        case 'transverse-mercator':
            return scaleProjection(geoTransverseMercator, tau, tau);
        default:
            throw new Error(`unknown projection type: ${projection}`);
    }
}

function scaleProjection(createProjection: ProjectionInitializer, kx: number, ky: number) {
    return {
        type: ({ width, height, rotate, precision = 0.15, clip }: ProjectionOptions) => {
            const projection = createProjection();
            if (precision != null) projection.precision?.(precision);
            if (rotate != null) projection.rotate?.(rotate);
            if (typeof clip === 'number') projection.clipAngle?.(clip);
            projection.scale(Math.min(width / kx, height / ky));
            projection.translate([width / 2, height / 2]);
            return projection;
        },
        aspectRatio: ky / kx
    };
}

function conicProjection(createProjection: ProjectionInitializer, kx: number, ky: number) {
    const { type, aspectRatio } = scaleProjection(createProjection, kx, ky);
    return {
        type: (options: ProjectionOptions) => {
            const { parallels, domain, width, height } = options;
            const projection = type(options);
            if (parallels != null) {
                (
                    projection as GeoProjection & {
                        parallels?: (p: [number, number]) => GeoProjection;
                    }
                ).parallels?.(parallels);
                if (domain === undefined) {
                    projection.fitSize([width, height], { type: 'Sphere' });
                }
            }
            return projection;
        },
        aspectRatio
    };
}
