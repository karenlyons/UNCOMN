import * as React from 'react';
import { escape } from '@microsoft/sp-lodash-subset';
import {
	Stack, IStackProps, IStackStyles,
	IIconProps,
	initializeIcons,
} from '@fluentui/react';
initializeIcons();

import styles from './FeedbackFooter.module.scss';
import { WebsiteFeedback, IWebsiteFeedbackProps } from '../WebsiteFeedback';
import { FeedbackTY, IFeedbackTYProps } from '../FeedbackTY';
import { IFeedbackFooterProps, IFeedbackFooterState } from '.';
import { WebsiteFeedbackService } from '../../services/WebsiteFeedbackService';
import { IWebsiteFeedbackItem, ISaveNewItem } from '../../models/IWebsiteFeedbackItem';

const cancelIcon: IIconProps = {​​​​​​​​ iconName:'Cancel' }​​​​​​​​;
const stackStyles: Partial<IStackStyles> = { root: { width: 650 } };
const stackTokens = { childrenGap: 50 };
const columnProps: Partial<IStackProps> = {
	tokens: { childrenGap: 15 },
	styles: { root: { } },
};

export class FeedbackFooter extends React.Component<IFeedbackFooterProps, IFeedbackFooterState> {
	private _websiteFeedbackService: WebsiteFeedbackService;

	constructor(props: IFeedbackFooterProps){
		super(props);

		this._websiteFeedbackService = new WebsiteFeedbackService(this.props.client, this.props.webAbsoluteUrl);

		this.state = {
			selectedWebsiteFeedback: null,
			wfModalMode: false,
			tyModalMode: false,
		};
	}

	private _handleFeedbackChange = (newValue: string) => {
		this.setState({ selectedWebsiteFeedback: newValue });
	}
 
	private _handleSubmitFeedbackModal = (e) => {​​​​​​​​​
		const newWebsiteFeedbackItem: IWebsiteFeedbackItem = {
			URL: window.location.href,
			ReleaseDate: new Date(),
			WebsiteFeedback: this.state.selectedWebsiteFeedback,
		};

		this._websiteFeedbackService.saveWebsiteFeedbackSPListItem(newWebsiteFeedbackItem)
		.then((saveNewItem: ISaveNewItem) => {
			// Show Thank You modal
			this.setState({​​​​​​​​​
				selectedWebsiteFeedback: '',
				wfModalMode: false,
				tyModalMode: true,
			}​​​​​​​​​);
		})
		.catch((error: any) => {
			alert(`Error submitting Website Feedback.  Please contact your administrator.  Ref: ${error}`);
		});
	}​​​​​​​​​

	private _handleShowFeedbackModal = (e) => {
		this.setState({ wfModalMode: true });
	}

	private _handleCloseFeedbackModal = (e) => {
		this.setState({ selectedWebsiteFeedback: '', wfModalMode: false });
	}

	private _renderWebsiteFeedbackModal = () => {
		const element: React.ReactElement<IWebsiteFeedbackProps> = React.createElement(
			WebsiteFeedback,
			{
				websiteFeedback: this.state.selectedWebsiteFeedback,
				wfModalMode: this.state.wfModalMode,
				onFeedbackChange: this._handleFeedbackChange,
				onSubmitModal: this._handleSubmitFeedbackModal,
				onCloseModal: this._handleCloseFeedbackModal,
			}
		);	

		return (element);
	}

	private _handleCloseThankYouModal = (e) => {
		this.setState({ tyModalMode: false });
	}

	private _renderFeedbackThankYouModal = () => {
		const element: React.ReactElement<IFeedbackTYProps> = React.createElement(
			FeedbackTY,
			{
				tyModalMode: this.state.tyModalMode,
				onCloseModal: this._handleCloseThankYouModal,
			}
		);	

		return (element);
	}

	public render = (): React.ReactElement<IWebsiteFeedbackProps> => {
		let year: number = new Date().getFullYear();
		return (
			<footer>
				<span className={styles.copyright}>
					&copy; Copyright {year} - UNCOMN | All Rights Reserved
				</span>
				<span className={styles.websiteFeedback}>
					<a href="javascript:void(0);" onClick={(e)=>this._handleShowFeedbackModal(e)} title="UGLInet Feedback">UGLInet Feedback</a>
				</span>
				{this._renderWebsiteFeedbackModal()}
				{this._renderFeedbackThankYouModal()}
			</footer>
		);
	}
}