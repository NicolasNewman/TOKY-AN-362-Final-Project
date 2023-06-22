import pandas as pd
import json
from multiprocessing import Pool, cpu_count

from ml.wordnet import get_hotwords
from ml.ngram import make_ngram, tfid
from ml.dicts import movieIdToDOR, movieIdToIdentifier, movieIdToName
from ml.repr import CustomDictList, CustomList, CustomListDict

# nltk.download('wordnet')

df = pd.read_json('../shared/src/raw.json')
df = df[df.columns.drop('review')]
df = df[df.columns.drop('title')]


stopwords = []
# stopwords = ["sosuke", "ashitaka", "ichihiro", "spirited", "chihiro", "turnip", "calcifer", "sophie", "ve", "hayao", "haku", "crayon"]
# stopwords = ["kiki", "ghibli", "miyazaki", "howl", "ponyo", "mononoke", "arrietty", "castle", "ashitaka", "totoro"]




movieIds = df["movieId"].unique().tolist()
# work = [[movieId, df[df["movieId"].eq(movieId)]] for movieId in movieIds]

def proc(data):
    movieId = data[0]
    subset: pd.DataFrame = data[1]

    print(f'[{movieId}] Begin processing (n={len(subset)})')
    # subset = df[df["movieId"].eq(movieId)]
    negative = subset[subset["rating"].le(2)]
    positive = subset[subset["rating"].ge(4)]
    mixed = subset[subset['rating'].eq(3)]
    strong = subset[subset['rating'].ne(3)]
    p3 = make_ngram(positive, 3, 30)
    p2 = make_ngram(positive, 2, 30)
    p1 = make_ngram(positive, 1, 30)

    n3 = make_ngram(negative, 3, 30)
    n2 = make_ngram(negative, 2, 30)
    n1 = make_ngram(negative, 1, 30)

    [pos_hw, neg_hw] = get_hotwords(subset['reviewEN'], movieId)

    years = {k: [] for k in dict.fromkeys(pd.to_datetime(subset['publishDate']).dt.year.unique())}
    strong['reviewEN'] = strong['reviewEN'].str.lower()
    d = {
        "movieId": movieId,
        "dor": movieIdToDOR[movieId],
        "reviews": subset.to_dict(orient="records"),
        "stats": {
            "avg": round(subset["rating"].mean(), 2),
            "avgStrong": round(subset[subset["rating"].ne(3)]["rating"].mean(), 2),
            "n": subset["rating"].count(),
            "nPositive": positive["rating"].count(),
            "nNegative": negative["rating"].count(),
            "nStrong": positive["rating"].count() + negative["rating"].count(),
            "nMixed": mixed["rating"].count(),
            "references": {
                "163027": strong["reviewEN"].str.contains(movieIdToIdentifier[163027]).sum(),
                "159561": strong["reviewEN"].str.contains(movieIdToIdentifier[159561]).sum(),
                "327529": strong["reviewEN"].str.contains(movieIdToIdentifier[327529]).sum(),
                "335800": strong["reviewEN"].str.contains(movieIdToIdentifier[335800]).sum(),
                "240799": strong["reviewEN"].str.contains(movieIdToIdentifier[240799]).sum(),
                "150435": strong["reviewEN"].str.contains(movieIdToIdentifier[150435]).sum(),
                "89972": strong["reviewEN"].str.contains(movieIdToIdentifier[89972]).sum(),
                "149868": strong["reviewEN"].str.contains(movieIdToIdentifier[149868]).sum(),
                "89778": strong["reviewEN"].str.contains(movieIdToIdentifier[89778]).sum(),
                "148901": strong["reviewEN"].str.contains(movieIdToIdentifier[148901]).sum(),
                "150436": strong["reviewEN"].str.contains(movieIdToIdentifier[150436]).sum(),
                "152271": strong["reviewEN"].str.contains(movieIdToIdentifier[152271]).sum(),
                "344584": strong["reviewEN"].str.contains(movieIdToIdentifier[344584]).sum(),
                "151441": strong["reviewEN"].str.contains(movieIdToIdentifier[151441]).sum(),
                "161722": strong["reviewEN"].str.contains(movieIdToIdentifier[161722]).sum()
            },
        },
        "positiveNGrams": {
            "1": p1,
            "2": p2,
            "3": p3
        },
        "positiveHotwords": pos_hw.to_dict(),
        "negativeNGrams": {           
            "1": n1,
            "2": n2,
            "3": n3,           
        },
        "negativeHotwords": neg_hw.to_dict()
    }
    d['stats']['references'][f'{movieId}'] = 0

    return d

def main():
    # with Pool(4) as p:
        # data = p.map(proc, work)
    work = [[movieId, df[df["movieId"].eq(movieId)]] for movieId in movieIds]
    data = [proc(w) for w in work]

    contentJSON = str(CustomListDict([f""""{d['movieId']}": {json.dumps(d, default=str, ensure_ascii=False)}""" for d in data]))

    content = f"""
    /* eslint-disable quotes */
    /* eslint-disable max-len */
    import {{ Data, Review }} from './types';

    export type MovieId = {' | '.join([str(mid) for mid in movieIds])};
    export const movieIdToName: {{[key in MovieId]: string}} = {{
        163027: 'Spirited Away',
        159561: 'Princess Mononoke',
        327529: 'Ponyo',
        335800: 'Secret World of Arrietty',
        240799: "Howl's Moving Castle",
        150435: 'My Neighbor Totoro',
        89972: "Kiki's Deliver Service",
        149868: 'Laputa: Castle in the Sky',
        89778: 'Whisper of the Heart',
        148901: 'Nausicaa of the Valley of the Wind',
        150436: 'Grave of the Fireflies',
        152271: 'Pom Poko',
        344584: 'The Wind Rises',
        151441: 'Only Yesterday',
        161722: 'My Neighbors the Yamadas'
    }};
    export const movieIdToIdentifier: {{[key in MovieId]: string}} = {{
        163027: 'spirited away',
        159561: 'mononoke',
        327529: 'ponyo',
        335800: 'arrietty',
        240799: "howl",
        150435: 'totoro',
        89972: 'kiki',
        149868: 'laputa',
        89778: 'whisper',
        148901: 'nausicaa',
        150436: 'grave of the fireflies',
        152271: 'pom poko',
        344584: 'wind rises',
        151441: 'only yesterday',
        161722: 'yamadas'
    }};
    """

    with open('../shared/src/data_full.json', 'w') as writer:
        writer.write(contentJSON)
    with open('../shared/src/data.ts', 'w') as writer:
        writer.write(content)

if __name__ == '__main__':
    main()