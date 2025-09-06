type AaplRow = {
    Date: Date;
    Open: number;
    High: number;
    Low: number;
    Close: number;
    Volume: number;
    [`Adj Close`]: number;
};

type SimpsonsRow = {
    episode: string;
    season: string;
    /**
     * the imdb rating of the episode
     */
    imdb_rating: number;
    title: string;
};

type PenguinsRow = {
    species: string;
    island: string;
    culmen_length_mm: number;
    culmen_depth_mm: number;
    flipper_length_mm: number;
    body_mass_g: number;
};

type LanguagesRow = {
    Language: string;
    Remarks: string;
    Family: string;
    Branch: string;
    [`First-language`]: string;
    [`Second-language`]: string;
    [`Total speakers`]: number;
};

type EarthquakeFeature = {
    type: 'Feature';
    properties: {
        mag: number;
        place: string;
        time: number;
        updated: number;
        url: string;
        detail: string;
        status: 'reviewed';
        tsunami: number;
        sig: number;
        net: string;
        code: string;
        ids: string;
        sources: string;
        types: string;
        nst: number;
        dmin: number;
        rms: number;
        gap: number;
        magType: string;
        type: 'earthquake';
        title: string;
    };
    geometry: {
        type: 'Point';
        coordinates: [number, number, number];
    };
    id: string;
};

type BeagleRow = {
    lon: number;
    lat: number;
};

type RiaaRow = {
    year: Date;
    format: string;
    group: string;
    revenue: number;
};

type MetrosRow = {
    Metro: string;
    POP_1980: number;
    LPOP_1980: number;
    R90_10_1980: number;
    POP_2015: number;
    LPOP_2015: number;
    R90_10_2015: number;
    nyt_display: string;
    state_display: string;
    highlight: number;
};

type WindRow = {
    longitude: number;
    latitude: number;
    u: number;
    v: number;
};

type ElectionRow = {
    // state,fips,margin2020,margin2016,votes,votes2016
    state: string;
    fips: number;
    margin2020: number;
    margin2016: number;
    votes: number;
    votes2016: number;
};

interface WorldAtlas extends TopoJSON.Topology {
    objects: {
        countries: {
            type: 'GeometryCollection';
            geometries: Array<TopoJSON.Polygon | TopoJSON.MultiPolygon>;
        };
        land: TopoJSON.GeometryCollection;
    };
    bbox: [number, number, number, number];
    transform: TopoJSON.Transform;
}

interface USAtlas extends TopoJSON.Topology {
    objects: {
        counties: {
            type: 'GeometryCollection';
            geometries: Array<TopoJSON.Polygon | TopoJSON.MultiPolygon>;
        };
        states: {
            type: 'GeometryCollection';
            geometries: Array<TopoJSON.Polygon | TopoJSON.MultiPolygon>;
        };
        nation: TopoJSON.GeometryCollection;
    };
    bbox: [number, number, number, number];
    transform: TopoJSON.Transform;
}

type SalesRow = {
    market: string;
    segment: string;
    value: number;
};

export type ExamplesData = {
    aapl: AaplRow[];
    simpsons: SimpsonsRow[];
    penguins: PenguinsRow[];
    languages: LanguagesRow[];
    earthquakes: {
        type: 'FeatureCollection';
        features: EarthquakeFeature[];
    };
    world: WorldAtlas;
    us: USAtlas;
    beagle: BeagleRow[];
    riaa: RiaaRow[];
    metros: MetrosRow[];
    sales: SalesRow[];
    wind: WindRow[];
    election: ElectionRow[];
};
