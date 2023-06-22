import pandas as pd
import spacy
from spacy.tokens import  Token
from spacy.language import Language
from spacytextblob.spacytextblob import SpacyTextBlob
from string import punctuation

from ml.network import WordNet

class Model(object):
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")
        nlp_coref = spacy.load("en_coreference_web_trf")

        nlp_coref.replace_listeners("transformer", "coref", ["model.tok2vec"])
        nlp_coref.replace_listeners("transformer", "span_resolver", ["model.tok2vec"])
        
        self.nlp.add_pipe("coref", source=nlp_coref)
        self.nlp.add_pipe("span_resolver", source=nlp_coref)
        self.nlp.add_pipe('spacytextblob')
    
    def is_stop(self, token: Token):
        return token.text in self.nlp.Defaults.stop_words or token.text in punctuation
    
    def get(self):
        return self.nlp

def is_ly_adv(token: Token):
    return token.pos_ == 'ADV' and token.text.endswith('ly')
# we won't copy over the span cleaner

nlp = Model().get()


def get_hotwords(series: pd.Series, movieId: int):
    # TODO: anything but this (reloading model for each proc)...
    series = series.str.lower()
    reviews = series.to_list()
    pos_tag = ['PROPN', 'ADJ', 'NOUN', 'VERB']
    pos_network = WordNet()
    neg_network = WordNet()

    for i,review in enumerate(reviews):
        doc = nlp(review)
        if ((i + 1) % 25 == 0):
            print(f'[{movieId}] {round((i / len(reviews)*100), 1)}%')
        for token in doc:
            if(token.text in nlp.Defaults.stop_words or (token.pos_ not in pos_tag and not is_ly_adv(token))):
                continue
            polarity = token._.blob.polarity
            if (polarity >= 0.0):
                token_node = pos_network.add(token.lemma_, polarity)
                for child in list(token.children):
                    if (child.text not in nlp.Defaults.stop_words and child.pos_ in pos_tag ):
                        child_node = pos_network.add(child.lemma_, child._.blob.polarity)
                        pos_network.add(token_node, child_node)
            if (polarity <= 0.0):
                token_node = neg_network.add(token.lemma_, polarity)
                for child in list(token.children):
                    if (child.text not in nlp.Defaults.stop_words and child.pos_ in pos_tag ):
                        child_node = neg_network.add(child.lemma_, child._.blob.polarity)
                        neg_network.add(token_node, child_node)
    return [pos_network, neg_network]
    

