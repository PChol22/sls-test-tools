import { SQS } from "aws-sdk";
import { TestResultOutput } from "../../utils/testResult";
declare const _default: {
    toHaveEvent(eventBridgeEvents?: SQS.ReceiveMessageResult): TestResultOutput;
};
export default _default;
