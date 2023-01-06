import { SPHttpClient } from "@microsoft/sp-http";

export interface IFeedbackFooterProps {
	client: SPHttpClient;
	webAbsoluteUrl: string;
}