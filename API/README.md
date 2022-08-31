# Brazilian Politics Classifier

Given a text input return whether the input is related to Brazilian politics.

Example request:
```
curl -X POST 'http://localhost:9091/items/' -H 'Content-Type: application/json' -d '{"title":"As eleições gerais no Brasil em 2022 estão agendadas para o dia 2 de outubro"}'
```

## Docker

```
docker build -t brpolitics .
docker run -p 9091:9091 brpolitics
```

## Model
The model is publicly available on HuggingFace: https://huggingface.co/meedan/brazilianpolitics

# Contact deteails


