import { StepFunctions as AWSStepFunctions } from "aws-sdk";
declare type StepFunctionOptions = {
    apiPollingDelay?: number;
};
export default class StepFunctions {
    stepFunctions: AWSStepFunctions | undefined;
    allStateMachines: AWSStepFunctions.ListStateMachinesOutput | undefined;
    apiPollingDelay: number;
    init(options?: StepFunctionOptions): Promise<void>;
    static build(options?: StepFunctionOptions): Promise<StepFunctions>;
    runExecution(stateMachineName: string, input: unknown, options?: StepFunctionOptions): Promise<AWSStepFunctions.DescribeExecutionOutput>;
    obtainStateMachineArn(stateMachineName: string): Promise<string>;
    obtainExecutionArn(StateMachineArn: string): Promise<string>;
}
export {};
