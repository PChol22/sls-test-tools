import { TestResultOutput } from "../../utils/testResult";
import { SQS } from "aws-sdk";
declare const _default: {
    toHaveEventWithSource(Events: SQS.ReceiveMessageResult, expectedSourceName: string): TestResultOutput;
};
export default _default;
