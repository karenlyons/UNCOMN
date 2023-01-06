export interface IWebsiteFeedbackProps {
	websiteFeedback: string;
	wfModalMode: boolean;				// true: display modal; false: hide modal
	onFeedbackChange: (newValue: any) => void;
	onSubmitModal: (e) => void;
	onCloseModal: (e) => void;
}