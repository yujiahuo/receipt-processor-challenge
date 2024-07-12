import * as crypto from 'crypto';

export class ReceiptProcessing {
	static pointsMap: { [id: string]: number; } = {};

	static processPoints(receiptJson: any): string{
		if (!this.isJsonValid(receiptJson)) return "";
	
		const points = this.calculatePoints(receiptJson);
		if (points === -1) return "";
	
		const id = this.getReceiptId(receiptJson);
		this.pointsMap[id] = points;
		return id;
	}

	// Assumes retailer/date/time is a composite primary key.
	// Hash to quickly get an ID. Irl we might want actual encryption and more secure data storage depending on needs.
	static getReceiptId(receiptJson: any) {
		const uniqueString = receiptJson["retailer"] + receiptJson["purchaseDate"] + receiptJson["purchaseTime"];
		return crypto.createHash('md5').update(uniqueString).digest('hex');
	}

	static calculatePoints(receiptJson: any) {
		let points = 0;
		points += this.calculatePtsRetailer(receiptJson["retailer"]);
		points += this.calculatePtsTotal(receiptJson["total"]);
		points += this.calculatePtsItems(receiptJson["items"]);
		points += this.calculatePtsDate(receiptJson["purchaseDate"]);
		points += this.calculatePtsTime(receiptJson["purchaseTime"]);

		return points;
	}

	// One point for every alphanumeric character in the retailer name
	static calculatePtsRetailer(retailer: string): number {
		return retailer.match(/[a-zA-Z0-9]/g)?.length || 0;
	}

	// 50 points if the total is a round dollar amount with no cents
	// 25 points if the total is a multiple of 0.25
	static calculatePtsTotal(total: number): number {
		let points = 0;

		if (Number.isInteger(total)) points += 50
		if (Number.isInteger(total / 0.25)) points += 25

		return points;
	}

	// 5 points for every two items on the receipt
	// If the trimmed length of the item description is a multiple of 3, multiply the price by 0.2 and round up to the nearest integer. The result is the number of points earned.
	static calculatePtsItems(items: any[]): number {
		let points = 0;

		points += Math.floor(items.length / 2) * 5;

		for (let item of items) {
			if (item["shortDescription"]?.trim().length % 3 === 0){
				points += Math.ceil(item["price"] * 0.2);
			}
		}
		return points;
	}

	// 6 points if the day in the purchase date is odd
	static calculatePtsDate(date: string): number {
		const splitDate = date.split("-");
		if (splitDate.length < 2 || !Number.isInteger(+splitDate[1])) return 0;

		if (Number(splitDate[1]) % 2 !== 0) return 6;
		else return 0;
	}

	// 10 points if the time of purchase is after 2:00pm and before 4:00pm
	// Assumes 24 hour time format and tz agnostic
	// Assumes we are not "afrer 2:00PM" at 2:00PM and we are not "before 4:00PM" at 4:00PM
	static calculatePtsTime(time: string): number {
		const splitTime = time.split(":");
		if (splitTime.length < 2 || !Number.isInteger(+splitTime[0]) || !Number.isInteger(+splitTime[1])) return 0;
		
		const hours = +splitTime[0];
		const minutes = +splitTime[1];
		if (hours < 16 && (hours > 14 || (hours === 14 && minutes > 0))) return 10;
		else return 0;
	}

	// Make sure all required pieces are in the json
	static isJsonValid(receiptJson: any){
		if (!receiptJson) return false;

		// retailer
		if (!receiptJson["retailer"]) return false;

		// purchasedate
		if (!receiptJson["purchaseDate"] || !this.isDateFormatValid(receiptJson["purchaseDate"])) return false;

		// purchasetime
		if (!receiptJson["purchaseTime"] || !this.isTimeFormatValid(receiptJson["purchaseTime"])) return false;

		// items
		if (!receiptJson["items"]) return false;

		// total
		if (!receiptJson["total"] || isNaN(+receiptJson["total"])) return false;

		return true;
	}

	// Expect yyyy-mm-dd
	static isDateFormatValid(purchaseDate: string) {
		const dateRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
		return dateRegex.test(purchaseDate);
	}

	// Expect 24 hour time, no am/pm, no tz
	static isTimeFormatValid(purchaseTime: string) {
		const timeRegex = /^[0-9]{1,2}:[0-9]{2}$/;
		return timeRegex.test(purchaseTime);
	}
}