
import { ReceiptProcessing } from "../src/receiptProcessing";

describe("Calculate points retailer", () => {
	test("Just alphanumeric", () => {
		expect(ReceiptProcessing.calculatePtsRetailer("target123")).toEqual(9);
	});

	test("Mix", () => {
		expect(ReceiptProcessing.calculatePtsRetailer("/  abc123 !@#$")).toEqual(6);
	});

	test("Space", () => {
		expect(ReceiptProcessing.calculatePtsRetailer(" ")).toEqual(0);
	});

	test("Trash", () => {
		expect(ReceiptProcessing.calculatePtsRetailer("!@#$%^&*()?<>[}'./*")).toEqual(0);
	});
});

describe("Calculate points total", () => {
	test("100", () => {
		expect(ReceiptProcessing.calculatePtsTotal(100)).toEqual(75);
	});

	test("100.00", () => {
		expect(ReceiptProcessing.calculatePtsTotal(100.00)).toEqual(75);
	});

	test("1.4", () => {
		expect(ReceiptProcessing.calculatePtsTotal(1.4)).toEqual(0);
	});

	test("0", () => {
		expect(ReceiptProcessing.calculatePtsTotal(0)).toEqual(75);
	});

	test("1.75", () => {
		expect(ReceiptProcessing.calculatePtsTotal(1.75)).toEqual(25);
	});

	// Technically a "round dollar amount" and a "multiple of 0.25" per the specs
	test("-10", () => {
		expect(ReceiptProcessing.calculatePtsTotal(-10)).toEqual(75);
	});

	test("Nan", () => {
		expect(ReceiptProcessing.calculatePtsTotal(NaN)).toEqual(0);
	});
});

describe("Calculate points items", () => {
	test("There are multiple items but they have wrong properties", () => {
		const items = [
			{
				"trashProperty": "meow"
			},
			{
				"trashProperty": "meow"
			}
		];
		expect(ReceiptProcessing.calculatePtsItems(items)).toEqual(5);
	});

	test("No items", () => {
		const items: any[] = [];
		expect(ReceiptProcessing.calculatePtsItems(items)).toEqual(0);
	});

	test("Odd blank items", () => {
		const items = [
			{},
			{},
			{},
			{},
			{}
		];
		expect(ReceiptProcessing.calculatePtsItems(items)).toEqual(10);
	});

	test("A good item, description multiple of 3", () => {
		const items = [
			{
				"shortDescription": "  abc ",
				"price": 100
			},
		];
		expect(ReceiptProcessing.calculatePtsItems(items)).toEqual(20);
	});

	test("Two good items, one multiple of 3", () => {
		const items = [
			{
				"shortDescription": "abc",
				"price": 100
			},
			{
				"shortDescription": "a",
				"price": 100
			},
		];
		expect(ReceiptProcessing.calculatePtsItems(items)).toEqual(25);
	});

	test("Two good items, one multiple of 3", () => {
		const items = [
			{
				"shortDescription": "abc",
				"price": 100
			},
			{
				"shortDescription": "a",
				"price": 100
			},
		];
		expect(ReceiptProcessing.calculatePtsItems(items)).toEqual(25);
	});

	test("Round correctly", () => {
		const items = [
			{
				"shortDescription": "abc",
				"price": 103
			}
		];
		expect(ReceiptProcessing.calculatePtsItems(items)).toEqual(21);
	});
});

describe("Calculate points date", () => {
	test("Not a date", () => {
		expect(ReceiptProcessing.calculatePtsDate("hello")).toEqual(0);
	});

	test("Bad format", () => {
		expect(ReceiptProcessing.calculatePtsDate("202-1")).toEqual(0);
	});

	test("Empty", () => {
		expect(ReceiptProcessing.calculatePtsDate("")).toEqual(0);
	});

	test("Good odd date", () => {
		expect(ReceiptProcessing.calculatePtsDate("2020-12-13")).toEqual(6);
	});

	test("Good even date", () => {
		expect(ReceiptProcessing.calculatePtsDate("2020-12-12")).toEqual(0);
	});
});

describe("Calculate points time", () => {
	test("Bad format", () => {
		expect(ReceiptProcessing.calculatePtsTime("hello")).toEqual(0);
	});

	test("Empty", () => {
		expect(ReceiptProcessing.calculatePtsTime("")).toEqual(0);
	});

	test("Time outside range", () => {
		expect(ReceiptProcessing.calculatePtsTime("1:00")).toEqual(0);
	});

	test("Time in range 1", () => {
		expect(ReceiptProcessing.calculatePtsTime("14:01")).toEqual(10);
	});

	test("Time in range 2", () => {
		expect(ReceiptProcessing.calculatePtsTime("15:59")).toEqual(10);
	});

	test("Range floor", () => {
		expect(ReceiptProcessing.calculatePtsTime("14:00")).toEqual(0);
	});

	test("Range ceiling", () => {
		expect(ReceiptProcessing.calculatePtsTime("16:00")).toEqual(0);
	});
});

describe("Validate date", () => {
	test("Good date 1", () => {
		expect(ReceiptProcessing.isDateFormatValid("2012-12-05")).toBeTruthy();
	});

	test("Good date 2", () => {
		expect(ReceiptProcessing.isDateFormatValid("2000-01-01")).toBeTruthy();
	});

	test("Bad date 1", () => {
		expect(ReceiptProcessing.isDateFormatValid("2012-12")).toBeFalsy();
	});

	test("Bad date 2", () => {
		expect(ReceiptProcessing.isDateFormatValid("202-12-12")).toBeFalsy();
	});

	test("Bad date 3", () => {
		expect(ReceiptProcessing.isDateFormatValid("tuesday")).toBeFalsy();
	});

	test("Empty", () => {
		expect(ReceiptProcessing.isDateFormatValid("")).toBeFalsy();
	});
});

describe("Validate time", () => {
	test("Good time 1", () => {
		expect(ReceiptProcessing.isTimeFormatValid("13:12")).toBeTruthy();
	});

	test("Good time 2", () => {
		expect(ReceiptProcessing.isTimeFormatValid("1:00")).toBeTruthy();
	});

	test("Bad time 1", () => {
		expect(ReceiptProcessing.isTimeFormatValid("11111:00")).toBeFalsy();
	});

	test("Bad time 2", () => {
		expect(ReceiptProcessing.isTimeFormatValid("1:3")).toBeFalsy();
	});

	test("Bad time 3", () => {
		expect(ReceiptProcessing.isTimeFormatValid("1233")).toBeFalsy();
	});

	test("Empty", () => {
		expect(ReceiptProcessing.isTimeFormatValid("")).toBeFalsy();
	});
});

describe("Integration tests", () => {
	test("All the points", () => {
		const receiptJson = {
			'retailer': '1234567',
  			'purchaseDate': '2022-03-21',
  			'purchaseTime': '14:33',
  			'items': [
				{
					'shortDescription': 'abc',
					'price': '11'
				},
				{
					'shortDescription': 'abc',
					'price': '11'
				},
				{
					'shortDescription': 'abc',
					'price': '11'
				},
				{
					'shortDescription': 'abc',
					'price': '11'
				}
			],
			'total': '9.00'
		}

		expect(ReceiptProcessing.calculatePoints(receiptJson)).toEqual(120);
	});

	test("Points from name only", () => {
		const receiptJson = {
			'retailer': '1234567',
  			'purchaseDate': '2022-03-20',
  			'purchaseTime': '1:33',
  			'items': [
				{
					'shortDescription': 'abcd',
					'price': '11'
				}
			],
			'total': '9.10'
		}

		expect(ReceiptProcessing.calculatePoints(receiptJson)).toEqual(7);
	});
});