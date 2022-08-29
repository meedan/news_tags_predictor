from fastapi import FastAPI, Request
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from transformers import Trainer, TrainingArguments

import torch
from torch.utils.data import Dataset
# from omegaconf import DictConfig, OmegaConf
# import hydra
import pandas as pd
from sklearn.model_selection import train_test_split
import numpy as np
# import wandb
import os
from sklearn.metrics import accuracy_score, f1_score, recall_score, precision_score


app = FastAPI()

def compute_metrics(outs):
    predictions, labels = outs
    predictions = np.argmax(predictions, axis = -1)

    ## computes overall scores (accuracy, f1, recall, precision)
    accuracy = accuracy_score(labels, predictions) * 100
    f1 = f1_score(labels, predictions, average = "macro") * 100
    recall = recall_score(labels, predictions, average = "macro") * 100
    precision = precision_score(labels, predictions, average = "macro") * 100

    return {
        "accuracy" : float(accuracy),
        "f1" : float(f1),
        "recall" : float(recall),
        "precision" : float(precision),
    }

def encode_labels(labels):
  labels_set = set(labels)
  endcoded_labels = labels
  # counter = 0
  # for current_label in labels_set:
  for j in range(len(endcoded_labels)):
    # print(endcoded_labels[j] )
    if endcoded_labels[j] == 'TRUE':
      endcoded_labels[j] = 1
    else:
      endcoded_labels[j] = 0
      # if endcoded_labels[j] == current_label:
      #   endcoded_labels[j] = counter
    # counter+=1
  return endcoded_labels

encode_labels(["x","health","y","x","z"])

def load_data(path):
    """
    read CSV file and return the tweets and labels lists
    """
    df = pd.read_csv(path)
    titles = df['title'].tolist()
    labels = encode_labels(df['Politics_Label'].tolist())
    print("max(labels)")

    print(max(labels))
    return titles, labels

class MultiDialectDataset(Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        if self.labels != None:
          item['labels'] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        return len(self.labels)

print("Loading Model...")
model = AutoModelForSequenceClassification.from_pretrained("/Users/ahmednasser/Downloads/fastapi_news_tags_classifier/model/best_ckpt", num_labels = 2)
print("Loading Tokenizer...")
tokenizer = AutoTokenizer.from_pretrained("/Users/ahmednasser/Downloads/fastapi_news_tags_classifier/model/best_ckpt")
trainer = Trainer(model=model)
# trainer.model = model.cuda()

@app.get("/is_politics/{title}")
def read_root(title: str, request: Request):
    client_host = request.client.host
    val_encodings = tokenizer([title],
                              truncation=True,
                              padding=True,
                              # max_length=model.config.max_position_embeddings
                              )
    val_ds = MultiDialectDataset(val_encodings, [0])
    val_pred = trainer.predict(val_ds)
    is_politics = 0
    if val_pred.predictions[0][0] > val_pred.predictions[0][1]:
        is_politics = 0
    else:
        is_politics = 1
    return {"is_politics": is_politics, "title": title}