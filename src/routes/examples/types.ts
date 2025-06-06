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
    bill_length_mm: number;
    bill_depth_mm: number;
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

export type ExamplesData = {
    simpsons: SimpsonsRow[];
    penguins: PenguinsRow[];
    languages: LanguagesRow[];
};
