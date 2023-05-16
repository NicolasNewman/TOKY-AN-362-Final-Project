import pandas as pd
import nltk
import re
from sklearn.feature_extraction.text import TfidfTransformer, TfidfVectorizer

nltk.download('wordnet')

df = pd.read_json('../shared/src/raw.json')

# ve = I've
stopwords = ["ponyo", "sosuke", "ashitaka", "ichihiro", "spirited", "chihiro", "turnip", "calcifer", "sophie", "ve", "hayao", "haku", "crayon"]
# stopwords = ["kiki", "ghibli", "miyazaki", "howl", "ponyo", "mononoke", "arrietty", "castle", "ashitaka", "totoro"]
movieIdToName = {
    163027: 'Spirited Away',
    159561: 'Mononoke',
    327529: 'Ponyo',
    335800: 'Arriety',
    240799: 'Howl\'s Moving Castle'
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
        f"""{{ngram:"{' '.join(ngram)}",occurence:{occurence}}}""" 
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



data = []
for movieId in df["movieId"].unique():
    subset = df[df["movieId"].eq(movieId)]
    negative = subset[subset["rating"].le(2)]
    positive = subset[subset["rating"].ge(4)]
   
    p3 = make_ngram(positive, 3, 25)
    p2 = make_ngram(positive, 2, 25)
    p1 = make_ngram(positive, 1, 25)

    n3 = make_ngram(negative, 3, 25)
    n2 = make_ngram(negative, 2, 25)
    n1 = make_ngram(negative, 1, 25)

    data.append(f"""
        {{
        movieId: {movieId},
        positiveNGrams: [
            {{
                n: 1,
                data: {str(p1).replace("'", "")}
            }},
            {{
                n: 2,
                data: {str(p2).replace("'", "")}
            }},
            {{
                n: 3,
                data: {str(p3).replace("'", "")}
            }},
        ],
        negativeNGrams: [
            {{
                n: 1,
                data: {str(n1).replace("'", "")}
            }},
            {{
                n: 2,
                data: {str(n2).replace("'", "")}
            }},
            {{
                n: 3,
                data: {str(n3).replace("'", "")}
            }},
        ]
        }},
        """
    )
print(str(data))