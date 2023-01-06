import * as React from 'react';
import { escape } from '@microsoft/sp-lodash-subset';
import {
	Stack, IStackProps, IStackStyles,
	DefaultButton, PrimaryButton, IconButton,
	Modal, 
	IIconProps,
	TextField,
} from '@fluentui/react';

import styles from './WebsiteFeedback.module.scss';
import { IWebsiteFeedbackProps } from './';

const cancelIcon: IIconProps = {​​​​​​​​ iconName:'Cancel' }​​​​​​​​;
const stackStyles: Partial<IStackStyles> = { root: { width: 650 } };
const stackTokens = { childrenGap: 50 };
const columnProps: Partial<IStackProps> = {
	tokens: { childrenGap: 15 },
	styles: { root: { } },
};

export interface IWebsiteFeedbackState {
	selectedWebsiteFeedback: string;
	showError: boolean;
}

export class WebsiteFeedback extends React.Component<IWebsiteFeedbackProps, IWebsiteFeedbackState> {

	constructor(props: IWebsiteFeedbackProps) {
		super(props);

		this.state = {
			selectedWebsiteFeedback: '',
			showError: false,
		};
	}

	private _handleFeedbackChange = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue: string) => {
		const showError: boolean = (newValue.trim().length > 0) ? false: true;
		this.props.onFeedbackChange(newValue);

		this.setState({ selectedWebsiteFeedback: newValue, showError });
	}
 
	private _handleSubmitModal = (e) => {​​​​​​​​​
		if (this.state.selectedWebsiteFeedback.length > 0) {
			this.props.onSubmitModal(e);
		} else {
			this.setState({ showError: true });
		}
	}​​​​​​​​​

	private _handleCloseModal = (e) => {
		this.setState({ showError: false });
		this.props.onCloseModal(e);
	}

	public render = (): React.ReactElement<IWebsiteFeedbackProps> => {
		return (
			<div className={ styles.websiteFeedback }>
				<div className={ styles.container }>
					<Modal
						titleAriaId="modalWebFeed"
						isOpen={this.props.wfModalMode}
						isBlocking={true} 
						containerClassName="formModalContainer"
					>
						<div className={ styles.formModalTitle }>
							<span id="modalWebFeed" className={ styles.modalTitleText }>UGLInet Feedback</span>
							<span className={ styles.modalClose }>
								<IconButton
									iconProps={cancelIcon}
									ariaLabel="Close Modal"
									onClick={(e)=>this._handleCloseModal(e)}
								/>
							</span>
						</div>
						<div className={ styles.formModalContainer }>
							<Stack horizontal tokens={stackTokens} styles={stackStyles}>
								<Stack {...columnProps}>
									<div className={ styles.formModalDesc }>We are always looking for ways to improve the website. Use the form below to submit your suggestions. We 
									review feedback on a continual basis.</div>
									<TextField
										multiline
										rows={3}
										resizable={false}
										value={this.props.websiteFeedback}
										onChange={(e, newValue) => this._handleFeedbackChange(e, newValue)}
									/>
									{this.state.showError && <div>Feedback cannot be blank.</div>}
								</Stack>
							</Stack>
						</div>
						<div className={ styles.formModalButtons} >
							<PrimaryButton className={ styles.btnSubmit } text="Submit" title="Submit" ariaLabel="Submit" onClick={(e)=>this._handleSubmitModal(e)} />
							<DefaultButton className={ styles.btnCancel } text="Cancel" title="Cancel" ariaLabel="Cancel" onClick={(e)=>this._handleCloseModal(e)} />
						</div>
					</Modal>
				</div>
			</div>
		);
	}
}