import mongoose from "mongoose";

const OrderDetailsSchema =new mongoose.Schema({
    orderHeader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderHeader',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    }
})

const OrderDetailsModel = 
mongoose.model('OrderDetails', OrderDetailsSchema)

export default OrderDetailsModel;