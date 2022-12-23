import requests

url = 'http://0.0.0.0:8081/items/'
data = {'title': 'Smith'}

response = requests.post(url, json=data)
print(response.text)