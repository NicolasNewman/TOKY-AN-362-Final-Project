import pandas as pd
import nltk
import re
import json
from sklearn.feature_extraction.text import TfidfTransformer, TfidfVectorizer

# nltk.download('wordnet')

df = pd.read_json('../shared/src/raw.json')

stopwords = []
# stopwords = ["sosuke", "ashitaka", "ichihiro", "spirited", "chihiro", "turnip", "calcifer", "sophie", "ve", "hayao", "haku", "crayon"]
# stopwords = ["kiki", "ghibli", "miyazaki", "howl", "ponyo", "mononoke", "arrietty", "castle", "ashitaka", "totoro"]
movieIdToName = {
    163027: 'Spirited Away',
    159561: 'Mononoke',
    327529: 'Ponyo',
    335800: 'Arrietty',
    240799: 'Howl\'s Moving Castle',
    150435: 'My Neighbor Totoro',
    89972: 'Kiki\'s Deliver Service',
    149868: 'Laputa: Castle in the Sky',
    89778: 'Whisper of the Heart',
    148901: 'Nausicaa of the Valley of the Wind',
    150436: 'Grave of the Fireflies',
    152271: 'Pom Poko',
    344584: 'The Wind Rises',
    151441: 'Only Yesterday',
    161722: 'My Neighbors the Yamadas',

}
movieIdToDOR = {
  89778: 1995,
  89972: 1989,
  148901: 1984,
  149868: 1986,
  150435: 1988,
  150436: 1988,
  151441: 1991,
  152271: 1994,
  159561: 1997,
  161722: 1999,
  163027: 2001,
  240799: 2004,
  327529: 2008,
  335800: 2010,
  344584: 2013
}

movieIdToIdentifier = {
    163027: 'spirited away',
    159561: 'mononoke',
    327529: 'ponyo',
    335800: 'arrietty',
    240799: 'howl',
    150435: 'totoro',
    89972: 'kiki',
    149868: 'laputa',
    89778: 'whisper',
    148901: 'nausicaa',
    150436: 'grave of the fireflies',
    152271: 'pom poko',
    344584: 'wind rises',
    151441: 'only yesterday',
    161722: 'yamadas',
}

def make_ngram(df: pd.DataFrame, pairsize = 3, cnt = 10):
    n = df["reviewENClean"].count()
    words = ''.join(str(df["reviewENClean"].to_list()))
    words = re.sub(r'[^\w\s]', '', words)
    # Replace 3 or more consecutive words 
    words = re.sub(r'(?:\s|^)((\w+)(?:\s+\2){2,})(?:\s|$)', r'\2', words).split()
    wnl = nltk.stem.WordNetLemmatizer()
    words = [wnl.lemmatize(word) for word in words if word not in stopwords]
    ngrams = (pd.Series(nltk.ngrams(words, pairsize)).value_counts())[:cnt]
    return  [
        # {'ngram': ' '.join(ngram), 'occurence': occurence}
        {'ngram': ' '.join(ngram), 'occurence': df['reviewENClean'].str.contains(' '.join(ngram)).sum()}
        for ngram,occurence in list(ngrams.items())
    ]


def tfid(df: pd.DataFrame):
    reviews = df['reviewENClean'].to_list()
    vectorizer = TfidfVectorizer(use_idf=True, ngram_range=(1, 3), stop_words=stopwords)
    fit = vectorizer.fit_transform(reviews)
    df2 = pd.DataFrame(
        fit[0].T.todense(),
        index=vectorizer.get_feature_names_out(),
        columns=["TF-IDF"]
    )
    df2 = df2.sort_values('TF-IDF', ascending=False)
    print(df2.head(25))

# Custom repr that doesn't add quotes around string values
class CustomList(list):
    def __repr__(self):
        return '[' + ', '.join([v for v in self]) + ']'
    
class CustomListDict(list):
    def __repr__(self):
        return '{' + ', '.join([v for v in self]) + '}'

class CustomDictList(dict[any, list]):
    def __repr__(self):
        return f"""
        {{
            {','.join([f'{k}: {CustomList(v)}' for k,v in self.items()])}
        }}
        """

movieReviews = []
data = []
movieIds = []
for movieId in df["movieId"].unique():
    movieIds.append(str(movieId))
    subset = df[df["movieId"].eq(movieId)]
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

    years = {k: [] for k in dict.fromkeys(pd.to_datetime(subset['publishDate']).dt.year.unique())}
    pos,neg,reviews,_ = zip(*[
            [
                f"m{movieId}[{i}]" if v["rating"] > 3 else None,
                f"m{movieId}[{i}]" if v["rating"] < 3 else None,
                f"m{movieId}[{i}]",
                years[pd.to_datetime(v['publishDate']).year].append(f"m{movieId}[{i}]")

        ] 
        for [i,v] in enumerate(subset.to_dict(orient='records'))
    ])
    pos = [x for x in list(pos) if x is not None]
    neg = [x for x in list(neg) if x is not None]
    movieReviews.append(f"const m{movieId}: Review[] = {subset.to_dict(orient='records')}")
    strong['reviewEN'] = strong['reviewEN'].str.lower()
    d = {
        'movieId': movieId,
        'dor': movieIdToDOR[movieId],
        'reviews': CustomList(reviews),
        'positive': CustomList(pos),
        'negative': CustomList(neg),
        'reviewByYears': CustomDictList(years),
        'stats': {
            'avg': round(subset['rating'].mean(), 2),
            'avgStrong': round(subset[subset['rating'].ne(3)]['rating'].mean(), 2),
            'n': subset['rating'].count(),
            'nPositive': positive['rating'].count(),
            'nNegative': negative['rating'].count(),
            'nStrong': positive['rating'].count() + negative['rating'].count(),
            'nMixed': mixed['rating'].count(),
            "references": {
                '163027': strong['reviewEN'].str.contains(movieIdToIdentifier[163027]).sum(),
                '159561': strong['reviewEN'].str.contains(movieIdToIdentifier[159561]).sum(),
                '327529': strong['reviewEN'].str.contains(movieIdToIdentifier[327529]).sum(),
                '335800': strong['reviewEN'].str.contains(movieIdToIdentifier[335800]).sum(),
                '240799': strong['reviewEN'].str.contains(movieIdToIdentifier[240799]).sum(),
                '150435': strong['reviewEN'].str.contains(movieIdToIdentifier[150435]).sum(),
                '89972': strong['reviewEN'].str.contains(movieIdToIdentifier[89972]).sum(),
                '149868': strong['reviewEN'].str.contains(movieIdToIdentifier[149868]).sum(),
                '89778': strong['reviewEN'].str.contains(movieIdToIdentifier[89778]).sum(),
                '148901': strong['reviewEN'].str.contains(movieIdToIdentifier[148901]).sum(),
                '150436': strong['reviewEN'].str.contains(movieIdToIdentifier[150436]).sum(),
                '152271': strong['reviewEN'].str.contains(movieIdToIdentifier[152271]).sum(),
                '344584': strong['reviewEN'].str.contains(movieIdToIdentifier[344584]).sum(),
                '151441': strong['reviewEN'].str.contains(movieIdToIdentifier[151441]).sum(),
                '161722': strong['reviewEN'].str.contains(movieIdToIdentifier[161722]).sum()
            },
        },
        'positiveNGrams': {
            '1': p1,
            '2': p2,
            '3': p3
        },
        'negativeNGrams': {           
            '1': n1,
            '2': n2,
            '3': n3,           
        }
    }
    d['stats']['references'][f'{movieId}'] = 0
    data.append(d)

content = f"""
/* eslint-disable quotes */
/* eslint-disable max-len */
import {{ Data, Review }} from './types';

{";".join(movieReviews)}
export type MovieId = {' | '.join(movieIds)};
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
export const data: {{[key in MovieId]: Data}} = {CustomListDict([f"'{d['movieId']}': {d}" for d in data])}
"""

with open('../shared/src/data.ts', 'w') as writer:
    writer.write(content)