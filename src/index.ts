import * as express from 'express';
import { Application } from 'express';
import { ReceiptProcessing } from './receiptProcessing';

const app: Application = express();
const port = process.env.PORT || 8080;
app.use(express.json());
app.listen(port, () => console.log(`app listening on http://locahost:${port}`));

app.get("/", (req, res) => {
	res.json({message: "App is running"});
})

app.post('/receipts/process', (req, res) => {
	const receiptJson = req.body;

	const id = ReceiptProcessing.processPoints(receiptJson);
	if (!id) {
		res.status(400).send("Hm, your receipt format doesn't look right.");
	}
	else {
		res.json(
			{ id: id }
		);
	}
});

app.get('/receipts/:id/points', (req, res) => {
	const {id} =  req.params;
	if (!(id in ReceiptProcessing.pointsMap)){
		res.status(400).send("ID is invalid. Did you do /receipts/process first?");
        return;
	}
	else {
		res.send(
			{ "points": ReceiptProcessing.pointsMap[id] }
		);
	}
});