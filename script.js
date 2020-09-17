const fs = require('fs');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const Http = new XMLHttpRequest();

const baseUrl = 'https://www.devicespecifications.com';
const regexBrand = /(?<=brand\/).*?(?=<\/a)/g;
const regexModel = /(?<=\/><\/a><h3><a href="https:\/\/www\.devicespecifications\.com\/en\/model\/).*?(?=<\/a><\/h3><p)/g;
let brands = [];

function getModel(brandId) {
	return new Promise(resolve => {
		const randomTimeout = Math.round((Math.random() + 0.5) * 1000); // between 0.5 and 1.5s
		setTimeout(() => {
			const HttpBrand = new XMLHttpRequest();
			const urlBrand = `${baseUrl}/en/brand/${brandId}`;
			HttpBrand.open('GET', urlBrand);
			HttpBrand.send();
			HttpBrand.onreadystatechange = e => {
				if (HttpBrand.readyState === 4) {
					const model = HttpBrand.responseText.match(regexModel).map(model => {
						return {
							name: model.split('">')[1],
							id: model.split('">')[0]
						};
					});
					resolve(model);
				}
			};
		}, randomTimeout);
	});
}

function dynamRegex(string, start, end) {
	const reg = new RegExp(`(?<=${start}).*?(?=${end})`, '');
	return string.match(reg) ? string.match(reg)[0] : '';
}

function arrayRegex(string, start, divider, end) {
	const reg = new RegExp(`(?<=${start})(.*?)${divider}(.*?)*?(?=${end})`, '');
	return string.match(reg).slice(1);
}

function getModelDescription(modelId) {
	return new Promise(resolve => {
		const HttpModel = new XMLHttpRequest();
		const urlBrand = `https://www.devicespecifications.com/en/model/${modelId}`;
		HttpModel.open('GET', urlBrand);
		HttpModel.send();
		HttpModel.onreadystatechange = e => {
			if (HttpModel.readyState === 4) {
				const str = HttpModel.responseText;
				let phone = {
					bodyConstuction: null, // Monoblock, slider or other
					width: dynamRegex(str, '<td>Width.*?<\\/span>', '<span>\\(millimeters'), // 70mm
					height: dynamRegex(str, '<td>Height.*?<\\/span>', '<span>\\(millimeters'), // 160mm
					thickness: dynamRegex(str, '<td>Thickness.*?<\\/span>', '<span>\\(millimeters'), // 9mm
					weight: dynamRegex(str, '<td>Weight.*?<\\/span>', '<span>\\(grams'), // 150 grams
					colors: dynamRegex(str, '<td>Colors.*?<\\/span>', '<\\/td><\\/tr>').split(
						'<br /><span class="arrow-bullet"></span>'
					), // red, black, white
					materials: dynamRegex(str, '<td>Body materials.*?<\\/span>', '<\\/td><\\/tr>').split(
						'<br /><span class="arrow-bullet"></span>'
					), // glass, ceramic, metal
					simType: dynamRegex(str, '<td>SIM card type.*?<\\/span>', '<\\/td>'), // mini, micro
					simCount: dynamRegex(str, '<td>Number of SIM cards.*?<td>', '<\\/td>'), // 1,2...
					simMode: dynamRegex(str, '<td>Number of SIM cards.*?<\\/span>', '<\\/td>'), // full or (sim or memoryCard)
					nGSM: dynamRegex(str, '<td>GSM.*?<\\/span>', '<\\/td><\\/tr>').split(
						'<br /><span class="arrow-bullet"></span>'
					), // gsm network frequencies
					nUMTS: dynamRegex(str, '<td>UMTS.*?<\\/span>', '<\\/td><\\/tr>').split(
						'<br /><span class="arrow-bullet"></span>'
					), // umts network frequencies
					nLTE: dynamRegex(str, '<td>LTE.*?<\\/span>', '<\\/td><\\/tr>').split(
						'<br /><span class="arrow-bullet"></span>'
					), // lte network frequencies
					os: dynamRegex(str, '<td>Operating system \\(OS\\).*?<\\/span>', '<\\/td><\\/tr>'), // Android 8.1
					soc: dynamRegex(str, '<td>SoC.*?<td>', '<\\/td><\\/tr'), // Snapdragon 845
					ramType: dynamRegex(str, '<td>RAM type.*?<td>', '<\\/td><\\/tr'), // Lpddr4x
					ranCapacity: dynamRegex(str, '<td>RAM capacity.*?<\\/span>', '<span>\\(gigabytes\\)<\\/span><\\/td>').split(
						'<span>(gigabytes)</span><br /><span class="arrow-bullet"></span>'
					), // 6Gb
					storageType: null, // UFS
					storageCapacity: dynamRegex(str, '<td>Storage.*?<\\/span>', '<span>\\(gigabytes\\)<\\/span><\\/td>').split(
						'<span>(gigabytes)</span><br /><span class="arrow-bullet"></span>'
					), // 128Gb
					memoryCards: null, // false or microSD
					displayTechnology: dynamRegex(str, '<td>Type/technology.*?<td>', '<\\/td><\\/tr'), // IPS, Amoled...
					displayWidth: str.match(
						/(?<=Approximate width of the display.*?\/span>).*?(\d{2,}.\d{2,}).*?(?=<span>\(millimeters)/
					)[1], // 70mm
					displayHeight: str.match(
						/(?<=Approximate height of the display.*?\/span>).*?(\d{2,}.\d{2,}).*?(?=<span>\(millimeters)/
					)[1], // 165mm
					displayDiagonal: str.match(
						/(?<=the length of its diagonal measured in inches\..*?\/span>).*?(\d{2,}.\d{2,}).*?(?=<span>\(millimeters)/
					)[1], //5.5 inches
					displayAspectRatio: null, // 2:1
					displayResolution: dynamRegex(str, '<td>Resolution.*?<\\/td><td>', '<\\/td>'), // 1080px * 1980px
					displayArea: dynamRegex(str, '<td>Display area.*?<\\/span>', '<span>\\(percent\\)'), // 85%
					displayDefence: null, // Corning Gorilla Glass 6
					sensors: dynamRegex(str, '<td>Sensors.*?\\/span>', '<\\/td>').split(
						'<br /><span class="arrow-bullet"></span>'
					), // Proximity Light Accelerometer Fingerprint
					primaryCameraCount: null, // 1,2,3,4
					primaryCameraSensorModel: dynamRegex(str, '<td>Sensor model.*?\\/td><td>', '<\\/td><\\/tr>'), // Sony IMX 298
					primaryCameraSensorType: dynamRegex(str, '<td>Sensor type.*?\\/td><td>', '<\\/td><\\/tr>'), // CMOS
					primaryCameraSensorSize: null, // 5*3.5mm
					primaryCameraAperture: dynamRegex(str, '<tr><td>Aperture.*?\\/td><td>', '<\\/td><\\/tr><tr>'), // f/2
					primaryCameraImageResolution: null, // 4000*3000px
					primaryCameraVideoResolution: null, // 1980*1080px
					primaryCameraVideoFPS: dynamRegex(
						str,
						'<td>Video FPS.*?\\/td><td>',
						'<span>\\(frames per second\\)<\\/span>'
					), // 30FPS
					primaryCameraFeautureAutofocus: null, // true
					primaryCameraFeautureOpticalStab: null, // true
					primaryCameraFeautureDigitalStab: null, // true
					FM:
						dynamRegex(str, 'has an FM radio receiver or not.<\\/p><\\/td><td>', '<\\/td><\\/tr>') === 'Yes'
							? true
							: false, // true
					GPS: [], // GPS, AGPS, Glonass
					bluetoothVersion: null, // 4.2
					bluetoothFeatures: [], // A2DP
					usbType: null, // MicroUSB
					usbVersion: null, // 2.0
					usbFastCharge: null, // false
					usbFastChargeVersion: null, // Quick Charge 3.0
					batteryCapacity: null, // 4000maH
					batteryType: null, // Li-ion
					headphoneJack: null, // true
					SARhead: null, // 0.99 W/kg
					SARbody: null // 0.99 W/kg
				};
				console.log(phone);
				resolve(phone);
			}
		};
	});
}

async function getModels(brandsArr) {
	const startTime = Date.now();
	for await (let brand of brandsArr) {
		await getModel(brand.id).then(models => {
			const loadedModelsNotise = `${brand.name} downloaded at ${(Date.now() - startTime) / 1000}s`;
			console.log(loadedModelsNotise);
			const targetBrand = brands.find(({ id }) => brand.id === id);
			targetBrand.models.push(...models);
		});
	}
	const finallyNotice = `Request ended at ${(Date.now() - startTime) / 1000}s`;
	console.log(finallyNotice);

	fs.writeFile('all-phones.json', JSON.stringify(brands), err => {
		if (err) throw err;
	});
}

function getBrands() {
	Http.open('GET', baseUrl);
	Http.send();
	Http.onreadystatechange = res => {
		if (Http.readyState == 4) {
			brands = Http.responseText.match(regexBrand).map(br => {
				return {
					name: br.split('">')[1],
					id: br.split('">')[0],
					models: []
				};
			});

			// getModels(brands);
			getModels(brands.slice(0, 2));
		}
	};
}

getBrands();
