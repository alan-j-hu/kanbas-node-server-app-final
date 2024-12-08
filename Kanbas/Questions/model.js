import mongoose from "mongoose";
import { baseQuestionSchema, multipleChoiceSchema, trueFalseSchema, fillInTheBlankSchema } from "./schema.js";

const BaseQuestionModel = mongoose.model("Question", baseQuestionSchema);

// Multiple Choice Model
const MultipleChoiceQuestionModel = BaseQuestionModel.discriminator(
    "Multiple Choice",
    multipleChoiceSchema
);

// True/False Model
const TrueFalseQuestionModel = BaseQuestionModel.discriminator(
    "True/False",
    trueFalseSchema
);

// Fill in the Blank Model
const FillInTheBlankQuestionModel = BaseQuestionModel.discriminator(
    "Fill in the Blank",
    fillInTheBlankSchema
);

// Export all models
export {
    BaseQuestionModel,
    MultipleChoiceQuestionModel,
    TrueFalseQuestionModel,
    FillInTheBlankQuestionModel,
};
