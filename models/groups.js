const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name:String,
    groupIcon:String,
    description:String,
    admin:{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
         },
         username: String,
    },
    members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
    ],

    messages :[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        },
    ]
});

module.exports = mongoose.model("Group",groupSchema);
