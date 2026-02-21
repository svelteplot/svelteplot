export type AaplRow = {
    Date: Date;
    Open: number;
    High: number;
    Low: number;
    Close: number;
    Volume: number;
    [`Adj Close`]: number;
};

export type SimpsonsRow = {
    episode: string;
    season: string;
    /**
     * the imdb rating of the episode
     */
    imdb_rating: number;
    title: string;
};

export type PenguinsRow = {
    species: string;
    island: string;
    culmen_length_mm: number;
    culmen_depth_mm: number;
    flipper_length_mm: number;
    body_mass_g: number;
};

export type BlsRow = {
    division: string;
    date: Date;
    unemployment: number;
};

export type LanguagesRow = {
    Language: string;
    Remarks: string;
    Family: string;
    Branch: string;
    [`First-language`]: string;
    [`Second-language`]: string;
    [`Total speakers`]: number;
};

export type EarthquakeFeature = {
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

export type BeagleRow = {
    lon: number;
    lat: number;
};

export type RiaaRow = {
    year: Date;
    format: string;
    group: string;
    revenue: number;
};

export type MetrosRow = {
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

export type WindRow = {
    longitude: number;
    latitude: number;
    u: number;
    v: number;
};

export type WalmartRow = {
    storenum: number;
    opendate: Date;
    city: string;
    state: string;
    lat: number;
    lon: number;
};

export type ElectionRow = {
    // state,fips,margin2020,margin2016,votes,votes2016
    state: string;
    fips: number;
    margin2020: number;
    margin2016: number;
    votes: number;
    votes2016: number;
};

export interface WorldAtlas extends TopoJSON.Topology {
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

export interface USAtlas extends TopoJSON.Topology {
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

export interface USStatesAtlas extends TopoJSON.Topology {
    objects: {
        states: {
            type: 'GeometryCollection';
            geometries: Array<TopoJSON.Polygon | TopoJSON.MultiPolygon>;
        };
        land: TopoJSON.GeometryCollection;
        innerborders: TopoJSON.GeometryCollection;
    };
    bbox: [number, number, number, number];
    transform: TopoJSON.Transform;
}

export type SalesRow = {
    market: string;
    segment: string;
    value: number;
};

export type QuarterlySalesRow = {
    market: string;
    segment: string;
    quarter: string;
    value: number;
};

export type StocksRow = {
    Symbol: string;
    Date: Date;
    Open: number;
    High: number;
    Low: number;
    Close: number;
    [`Adj Close`]: number;
    Volume: number;
};

export type GistempRow = {
    Date: Date;
    Anomaly: number;
};

export type TradeRow = {
    Year: Date;
    Imports: number;
    Exports: number;
};

export type OlympiansRow = {
    id: number;
    name: string;
    nationality: string;
    sex: 'male' | 'female';
    date_of_birth: Date;
    height: number;
    weight: number;
    sport: string;
    gold: number;
    silver: number;
    bronze: number;
    info: string;
};

export type Presidents2Row = {
    Name: string;
    'Very Favorable %': number;
    'Somewhat Favorable %': number;
    'Somewhat Unfavorable %': number;
    'Very Unfavorable %': number;
    'Don’t know %': number;
    'Have not heard of them %': number;
    'First Inauguration Date': Date;
    'Portrait URL': string;
};

export type IrisRow = {
    Species: string;
    'Sepal.Length': number;
    'Sepal.Width': number;
    'Petal.Length': number;
    'Petal.Width': number;
};

export type Iris2Row = {
    id: number;
    Species: string;
    Measurement: 'Sepal.Length' | 'Sepal.Width' | 'Petal.Length' | 'Petal.Width';
    Value: number;
};

export type CarsRow = {
    // manufactor,model,economy (mpg),cylinders,displacement (cc),power (hp),weight (lb),0-60 mph (s),year
    manufactor: string;
    model: string;
    ['economy (mpg)']: number;
    cylinders: number;
    ['displacement (cc)']: number;
    ['power (hp)']: number;
    ['weight (lb)']: number;
    ['0-60 mph (s)']: number;
    year: number;
};

/*
date,precipitation,temp_max,temp_min,wind,weather
2012-01-01,0,12.8,5,4.7,drizzle
*/
export type SeattleRow = {
    date: Date;
    precipitation: number;
    temp_max: number;
    temp_min: number;
    wind: number;
    weather: 'drizzle' | 'rain' | 'sun' | 'snow' | 'fog';
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
    statesTopo: USStatesAtlas;
    beagle: BeagleRow[];
    riaa: RiaaRow[];
    metros: MetrosRow[];
    sales: SalesRow[];
    sales2: QuarterlySalesRow[];
    wind: WindRow[];
    election: ElectionRow[];
    countries_2020: {
        country: string;
        year: number;
        population: number;
        continent: string;
    }[];
    gistemp: GistempRow[];
    trade: TradeRow[];
    stocks: StocksRow[];
    olympians: OlympiansRow[];
    presidents2: Presidents2Row[];
    walmart: WalmartRow[];
};
