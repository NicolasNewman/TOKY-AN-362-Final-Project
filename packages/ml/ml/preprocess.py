import pandas as pd
import nltk

from nlpretext import Preprocessor
from nlpretext.basic.preprocess import (normalize_whitespace, remove_punct, remove_eol_characters,
remove_stopwords, lower_text)

wnl = nltk.stem.WordNetLemmatizer()

preprocessorEN = Preprocessor()
preprocessorEN.pipe(lower_text)
preprocessorEN.pipe(remove_punct)
preprocessorEN.pipe(remove_eol_characters)
preprocessorEN.pipe(remove_stopwords, args={'lang': 'en'})
preprocessorEN.pipe(normalize_whitespace)
preprocessorEN.pipe(lambda x: ' '.join([wnl.lemmatize(word) for word in x.split()]))

preprocessorJA = Preprocessor()
preprocessorJA.pipe(lower_text)
preprocessorJA.pipe(remove_punct)
preprocessorJA.pipe(remove_eol_characters)
preprocessorJA.pipe(normalize_whitespace)


df = pd.read_json('../shared/src/raw.json')
df["reviewEN"] = df["reviewEN"].astype('string')
df["reviewENClean"] = df["reviewEN"].map(lambda x: preprocessorEN.run(x))
print(df["reviewENClean"].head(6))
df.to_json('../shared/src/raw.json', orient='records', force_ascii=False)
