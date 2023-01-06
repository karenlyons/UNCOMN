export interface IWebsiteFeedbackItem {
	URL: string;
	ReleaseDate: Date;
	WebsiteFeedback: string;
}

// Response from saving a new list item
export interface ISaveNewItem {
	NewListItemId: number;
	ETag: string;
}