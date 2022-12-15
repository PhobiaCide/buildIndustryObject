# 🎇 buildIndustryObject.js 👀

## 🏷 Summary

### 👨‍🚀 A Google Apps Script that gathers various data from the 🌌 Eve Online Static Data Export and compiles them into a .JSON object to be used for calculating the material and time costs of running a given job.

---

## 📄 Documentation

### 🚀 [Click here 🔗](https://phobiacide.github.io/buildIndustryObject/) to view the docs!

---

## 🪐 Sample Output

### ⚙️ What follows is the industry data for building a Bantam:

```json

[
	{
		blueprint: {
			name: 'Bantam Blueprint',
			group: 'Frigate Blueprint',
			marketGroup: 'Caldari',
			category: 'Blueprint',
			imgUrl: 'https://images.evetech.net/types/683/bp'
		},
		product: {
			name: 'Bantam',
			group: 'Frigate',
			marketGroup: 'Caldari',
			category: 'Ship',
			imgUrl: 'https://images.evetech.net/types/582/icon'
		},
		quantity: 1,
		activityName: 'Manufacturing',
		materials: [
			{
				name: 'Tritanium',
				quantity: 24000,
				group: 'Mineral',
				marketGroup: 'Minerals',
				category: 'Material',
				imgUrl: 'https://images.evetech.net/types/34/icon'
			},
			{
				name: 'Pyerite',
				quantity: 4500,
				group: 'Mineral',
				marketGroup: 'Minerals',
				category: 'Material',
				imgUrl: 'https://images.evetech.net/types/35/icon'
			},
			{
				name: 'Mexallon',
				quantity: 1875,
				group: 'Mineral',
				marketGroup: 'Minerals',
				category: 'Material',
				imgUrl: 'https://images.evetech.net/types/36/icon'
			},
			{
				name: 'Isogen',
				quantity: 375,
				group: 'Mineral',
				marketGroup: 'Minerals',
				category: 'Material',
				imgUrl: 'https://images.evetech.net/types/37/icon'
			}
		],
		time: 6000,
		probability: 1,
		skills: [{ skillName: 'Industry', level: 1 }]
	},

---
