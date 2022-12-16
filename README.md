<div align="center">

# 🎇 buildIndustryObject.js

![Google Drive Badge](https://img.shields.io/badge/%20-Google%20Drive-%20?style=for-the-badge&color=purple&label=%20&logo=googledrive&logoColor=white&logowidth=60) 
![Google Sheets Badge](https://img.shields.io/badge/%20-Google%20Sheets-%20?style=for-the-badge&color=purple&label=%20&logo=googlesheets&logoColor=white&logowidth=60) ![V8 Badge](https://img.shields.io/badge/%20-V8-%20?style=for-the-badge&color=purple&label=%20&logo=v8&logoColor=white&logowidth=60) 
![Swagger Badge](https://img.shields.io/badge/%20-Swagger-%20?style=for-the-badge&color=purple&label=%20&logo=swagger&logoColor=white&logowidth=60) 
![javascript Badge](https://img.shields.io/badge/%20-javascript-%20?style=for-the-badge&color=purple&label=%20&logo=javascript&logoColor=white&logowidth=60) 

</div>

## Overview 👀

#### 👨‍🚀 A Google Apps Script that gathers various data from the 🌌 Eve Online Static Data Export and compiles them into a .JSON object to be used for calculating the material and time costs of running a given job. 🚀

---

## 📄 Documentation ![Read The Docs Badge](https://img.shields.io/badge/%20-Read%20The%20Docs-%20?style=for-the-badge&color=purple&label=%20&logo=readthedocs&logoColor=white&logowidth=60)

### [Click here 🔗](https://phobiacide.github.io/buildIndustryObject/) to view the docs!

---

## 🪐 Sample Output ![json Badge](https://img.shields.io/badge/%20-json-%20?style=for-the-badge&color=purple&label=%20&logo=json&logoColor=white&logowidth=60)

### What follows is the industry data for building a Bantam

```json
[
	{
		"blueprint": {
			"name": "Bantam Blueprint",
			"group": "Frigate Blueprint",
			"marketGroup": "Caldari",
			"category": "Blueprint",
			"imgUrl": "https://images.evetech.net/types/683/bp"
		},
		"product": {
			"name": "Bantam",
			"group": "Frigate",
			"marketGroup": "Caldari",
			"category": "Ship",
			"imgUrl": "https://images.evetech.net/types/582/icon"
		},
		"quantity": 1,
		"activityName": "Manufacturing",
		"materials": [
			{
				"name": "Tritanium",
				"quantity": 24000,
				"group": "Mineral",
				"marketGroup": "Minerals",
				"category": "Material",
				"imgUrl": "https://images.evetech.net/types/34/icon"
			},
			{
				"name": "Pyerite",
				"quantity": 4500,
				"group": "Mineral",
				"marketGroup": "Minerals",
				"category": "Material",
				"imgUrl": "https://images.evetech.net/types/35/icon"
			},
			{
				"name": "Mexallon",
				"quantity": 1875,
				"group": "Mineral",
				"marketGroup": "Minerals",
				"category": "Material",
				"imgUrl": "https://images.evetech.net/types/36/icon"
			},
			{
				"name": "Isogen",
				"quantity": 375,
				"group": "Mineral",
				"marketGroup": "Minerals",
				"category": "Material",
				"imgUrl": "https://images.evetech.net/types/37/icon"
			}
		],
		"time": 6000,
		"probability": 1,
		"skills": [{ "skillName": "Industry", "level": 1 }]
	}
]

```
