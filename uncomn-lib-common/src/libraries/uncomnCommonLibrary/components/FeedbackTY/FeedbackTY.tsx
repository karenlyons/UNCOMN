import * as React from 'react';
import { escape } from '@microsoft/sp-lodash-subset';
import {
	Stack, IStackProps, IStackStyles,
	DefaultButton, IconButton,
	Modal, 
	IIconProps,
	TextField,
} from '@fluentui/react';

import styles from './FeedbackTY.module.scss';
import { IFeedbackTYProps } from '.';

const cancelIcon: IIconProps = {​​​​​​​​ iconName:'Cancel' }​​​​​​​​;
const stackStyles: Partial<IStackStyles> = { root: { width: 650 } };
const stackTokens = { childrenGap: 50 };
const columnProps: Partial<IStackProps> = {
	tokens: { childrenGap: 15 },
	styles: { root: { } },
};

export class FeedbackTY extends React.Component<IFeedbackTYProps, {}> {

	constructor(props: IFeedbackTYProps) {
		super(props);
	}

	private _handleCloseModal = (e) => {
		this.props.onCloseModal(e);
	}

	public render = (): React.ReactElement<IFeedbackTYProps> => {
		return (
			<div className={ styles.feedbackTY }>
				<div className={ styles.container }>
					<Modal
						titleAriaId="modalWebFeed"
						isOpen={this.props.tyModalMode}
						isBlocking={true} 
						containerClassName="formModalContainer"
					>
						<div className={ styles.formModalTitle }>
							<span id="modalWebFeed" className={ styles.modalTitleText }>Thank You</span>
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
									<div className={ styles.formModalDesc }>Thank You.  We have received your feedback.</div>
								</Stack>
							</Stack>
						</div>
						<div className={ styles.formModalButtons} >
							<DefaultButton className={ styles.btnCancel } text="Close" title="Close" ariaLabel="Close" onClick={(e)=>this._handleCloseModal(e)} />
						</div>
					</Modal>
				</div>
			</div>
		);
	}
}