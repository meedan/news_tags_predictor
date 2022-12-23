# news_tags_predictor
Predicting news tags using news articles' titles

'/API' Contains a Fastapi implementation of an api to deploy and serve the model.
The model itself is hosted on Huggingface via https://huggingface.co/meedan/brazilianpolitics 

'/bot' Contains a Nodejs implementatoin of a lambda function that serves a Check-bot to automatically add a tag 'politics' to items that are classified to be related to the Brazilian elections.
