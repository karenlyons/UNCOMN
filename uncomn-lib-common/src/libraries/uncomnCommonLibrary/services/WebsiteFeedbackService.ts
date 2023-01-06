import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';

import { IWebsiteFeedbackItem, ISaveNewItem } from '../models/IWebsiteFeedbackItem';

const LIST_WEBSITE_FEEDBACK: string = "Website Feedback";

export class WebsiteFeedbackService {
	private _spHttpOptions: any = {
		getNoMetadata: <ISPHttpClientOptions> {
			headers: { 
				'ACCEPT': 'application/json;odata.metadata=none',
				'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
			}
		},
		getFullMetadata: <ISPHttpClientOptions>{
			headers: {
				'ACCEPT': 'application/json; odata.metadata=full',
				'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
			}
		},
		postNoMetadata: <ISPHttpClientOptions>{
			headers: {
				'ACCEPT': 'application/json;odata.metadata=none',
				'CONTENT-TYPE': 'application/json',
				'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
			}
		},
	};

	constructor(private client: SPHttpClient, private webAbsoluteUrl: string) { }

	public saveWebsiteFeedbackSPListItem = (newWebsiteFeedbackItem: IWebsiteFeedbackItem): Promise<ISaveNewItem> => {
		return new Promise<ISaveNewItem>((resolve, reject) => {
			let etag: string;

			this._getItemEntityTypeForList(LIST_WEBSITE_FEEDBACK)
			.then((spEntityType: string) => {
				let newListItem: any = this._createNewWebsiteFeedbackItem(newWebsiteFeedbackItem);

				newListItem['@odata.type'] = spEntityType;

				let requestDetails: any = this._spHttpOptions.postNoMetadata;
				requestDetails.body = JSON.stringify(newListItem);

			  	return this.client.post(`${this.webAbsoluteUrl}/_api/web/lists/getByTitle('${LIST_WEBSITE_FEEDBACK}')/items`,
					SPHttpClient.configurations.v1,
					requestDetails
			  	);
			})
			.then((response: SPHttpClientResponse): Promise<any> => {
				if (response.status != 201) {
					throw new Error(`StatusCode: ${response.status}`);
				}

				etag = response.headers.get('ETag');
			 	return response.json();
			})
			.then((newSpListItem: any): void => {
				if (!newSpListItem || !('Id' in newSpListItem)) {
					throw new Error(`newSpListItem is undefined or Id doesn't exist.`);
				}

				const saveNewItem: ISaveNewItem = { NewListItemId: newSpListItem.Id, ETag: etag };
				resolve(saveNewItem);
			})
			.catch((error: any) => {
				reject(`ERROR WebsiteFeedbackService.saveWebsiteFeedbackSPListItem.  Ref: ${error}`);
			});
		});
	}

	// Converts IWebsiteFeedbackItem to a JSON object using the list's internal names
	private _createNewWebsiteFeedbackItem = (newWebsiteFeedbackItem: IWebsiteFeedbackItem): any => {
		return ({
			URL: {
				Url: newWebsiteFeedbackItem.URL,
				Description: null
			},
			ReleaseDate: newWebsiteFeedbackItem.ReleaseDate ? newWebsiteFeedbackItem.ReleaseDate.toISOString() : null,
			WebsiteFeedback: (newWebsiteFeedbackItem.WebsiteFeedback && newWebsiteFeedbackItem.WebsiteFeedback.length > 0) ? newWebsiteFeedbackItem.WebsiteFeedback : null,
		});
	}

	private _getItemEntityTypeForList = (listName: string, spEntityType?: string): Promise<string> => {
		return new Promise<string>((resolve, reject) => {
			if (spEntityType && spEntityType.length > 0) {
				resolve(spEntityType);
			}

			this.client.get(`${this.webAbsoluteUrl}/_api/web/lists/getByTitle('${listName}')?$select=ListItemEntityTypeFullName`,
				SPHttpClient.configurations.v1,
				this._spHttpOptions.getNoMetadata
			)
			.then((response: SPHttpClientResponse): Promise<{ ListItemEntityTypeFullName: string }> => {
				if (response.status != 200) {
					throw new Error(`StatusCode: ${response.status}`);
				}

				return response.json();
			})
			.then((response: { ListItemEntityTypeFullName: string }): void => {
				resolve(response.ListItemEntityTypeFullName);
			})
			.catch((error: any) => {
				reject(`ERROR WebsiteFeedbackService._getItemEntityTypeForList on List ${listName}.  Ref: ${error}`);
			});
		});
	}
}