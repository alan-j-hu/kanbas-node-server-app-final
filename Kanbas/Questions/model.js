import mongoose from "mongoose";
import { baseQuestionSchema, multipleChoiceSchema, trueFalseSchema, fillInTheBlankSchema } from "./schema.js";

const BaseQuestionModel = mongoose.model("Question", baseQuestionSchema);

// Multiple Choice Model
const MultipleChoiceQuestionModel = BaseQuestionModel.discriminator(
    "MultipleChoice",
    multipleChoiceSchema
);

// True/False Model
const TrueFalseQuestionModel = BaseQuestionModel.discriminator(
    "TrueFalse",
    trueFalseSchema
);

// Fill in the Blank Model
const FillInTheBlankQuestionModel = BaseQuestionModel.discriminator(
    "FillInTheBlank",
    fillInTheBlankSchema
);

// Export all models
export {
    BaseQuestionModel,
    MultipleChoiceQuestionModel,
    TrueFalseQuestionModel,
    FillInTheBlankQuestionModel,
};
