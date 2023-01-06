import * as React from 'react';
import * as ReactDom from 'react-dom';
interface NavigationEventDetails extends Window {
	_cssLinkObserver: MutationObserver;
	isChangedEventSubscribed: boolean;
	isBeforeUnloadSubscribed: boolean;
}
declare const window: NavigationEventDetails;

import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';

import styles from './UncomnFooter.module.scss';
import { escape } from '@microsoft/sp-lodash-subset';
import { FeedbackFooter, IFeedbackFooterProps } from 'uncomn-lib-common';
import * as strings from 'UncomnFooterApplicationCustomizerStrings';

const LOG_SOURCE: string = 'UncomnFooterApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IUncomnFooterApplicationCustomizerProperties {
 	// This is an example; replace with your own property
   Top: string;
   Bottom: string;
   enableLogging: boolean;
   hubCssUrl:     string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class UncomnFooterApplicationCustomizer
  extends BaseApplicationCustomizer<IUncomnFooterApplicationCustomizerProperties> {

    private _topPlaceholder: PlaceholderContent | undefined;
    private _bottomPlaceholder: PlaceholderContent | undefined;
    private _tenantURL: string;
  
    @override
    public onInit(): Promise<void> {
      Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

	  try {
			let topUrl = this.context.pageContext.web.absoluteUrl;
			if (this.context.pageContext.site.serverRelativeUrl.length > 1) {
				topUrl = topUrl.replace(`${this.context.pageContext.site.serverRelativeUrl}`, '');
			}
			this._tenantURL = `${topUrl}.mcas.ms`;      

			this._observerCallback = this._observerCallback.bind(this);
			if (window._cssLinkObserver) {
				window._cssLinkObserver.disconnect();
			}
			this.renderObserver = this.renderObserver.bind(this);
			this.context.placeholderProvider.changedEvent.remove(this, () => this.renderObserver(this));
			window.isChangedEventSubscribed = false;

			this._windowBeforeUnload = this._windowBeforeUnload.bind(this);
			window.removeEventListener('beforeunload', (e) => this._windowBeforeUnload(e));
			window.isBeforeUnloadSubscribed = false;

			this._onDispose = this.onDispose.bind(this);

			this._injectHubFiles();

			this.context.placeholderProvider.changedEvent.add(this, () => this.renderObserver(this));
			window.isChangedEventSubscribed = true;

			this._renderPlaceHolders();
		} catch (ex) {
			console.log('UncomnFooterApplicationCustomizer.onInit catch: ', ex);
		}

      return Promise.resolve();
    }
  
    private _onDispose(): void {
		try {
			if (window._cssLinkObserver) {
				window._cssLinkObserver.disconnect();
			}
	
			this.context.placeholderProvider.changedEvent.remove(this, () => this.renderObserver(this));
			window.isChangedEventSubscribed = false;
			window.removeEventListener('beforeunload', (e) => this._windowBeforeUnload(e));
			window.isBeforeUnloadSubscribed = false;
		} catch (ex) {
			console.log('UncomnFooterApplicationCustomizer._onDispose catch: ', ex);
		}
    }
  
    private _renderPlaceHolders(): void {
  
      // Handling the top placeholder
      if (!this._topPlaceholder) {
        this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(
          PlaceholderName.Top,
          { onDispose: this._onDispose }
        );
  
        // The extension should not assume that the expected placeholder is available.
        if (!this._topPlaceholder) {
          console.error("The expected placeholder (Top) was not found.");
          return;
        }
  
        if (this.properties) {
          let topString: string = this.properties.Top;
          if (!topString) {
            topString = "(Top property was not defined.)";
          }
  
          if (this._topPlaceholder.domElement) {
            this._topPlaceholder.domElement.innerHTML = `
            <!--
            <div class="${styles.app}">
              <div class="${styles.top}">
                <header>-->
                  <!--<i class="ms-Icon ms-Icon--Info" aria-hidden="true"></i> ${escape(topString)}-->
                  <!--<div class="${styles.logo}"><a href="../"><img src="/Style%20Library/uncomnLogo.png"/></a></div>
                  <div class="${styles.headerIcons}">
                    <img src="/Style%20Library/headerIcons.png"/>
                  </div>
                  <div class="${styles.weather}">
                    <div class="${styles.degrees}">77&deg;F</div>
                    <div class="${styles.location}">Los Angeles, California</div>
                  </div>
                </header>
                <nav>
                </nav>
              </div>
            </div>
            -->`;
          }
        }
      }
  
      try {
        if (!this._bottomPlaceholder) {
          this._bottomPlaceholder = this.context.placeholderProvider.tryCreateContent(
            PlaceholderName.Bottom,
            { onDispose: this._onDispose }
          );
  
          // The extension should not assume that the expected placeholder is available.
          if (!this._bottomPlaceholder) {
            console.error('The expected placeholder (Bottom) was not found.');
            return;
          }
  
          // if it is available, and access to domElement, update contents
          if (this._bottomPlaceholder.domElement) {
            this._renderFeedbackFooter();
  					//this._bottomPlaceholder.domElement.innerHTML = this._getFooterHtml();
          }
        }
      } catch (ex) {
        console.log('BrandingApplicationCustomizer._renderFooter catch: ', ex);
      }
    }
  
	// Add an observer to detect if <title> changes and change the theme color
	private async renderObserver(ev): Promise<void> {
		let titleElem = document.querySelector("title");

		window._cssLinkObserver = new MutationObserver((e) => {
			this._observerCallback(e);
		});
	
		if (titleElem) {
			window._cssLinkObserver.observe(titleElem, {
				childList: true,
				attributes: true,
				attributeOldValue: true,
				subtree:true,
			});
		}
	}

	private _observerCallback(e) {
		try {
			if (this._bottomPlaceholder && this._bottomPlaceholder.domElement) {
				this._injectHubFiles();	
			} else {
				this._renderPlaceHolders();
			}
		} catch (ex) {
			console.log('UncomnFooterApplicationCustomizer._observerCallback catch ', ex);
		}
	}

    private _injectHubFiles(): void {
      const hubCssUrl: string = this.properties.hubCssUrl;
      const head: any         = document.getElementsByTagName("head")[0] || document.documentElement;
      const body: any         = document.getElementsByTagName("body")[0];

	  const hubCssElem = document.querySelector('#hubCss');
	  if (!hubCssElem) {
		if (hubCssUrl) {
			console.log('UncomnFooterApplicationCustomizer - adding hubCss link');
			let customStyle: HTMLLinkElement = document.createElement("link");
			customStyle.href = `${this._tenantURL}/SiteAssets/${hubCssUrl}`;
			customStyle.rel  = "stylesheet";
			customStyle.type = "text/css";
			customStyle.id	 = 'hubCss';
		
			head.insertAdjacentElement("beforeend", customStyle);
		}
	  } else {
		  console.log('UncomnFooterApplicationCustomizer - hubCSS link already exists');
	  }
    }
  
      /**
       * Create HTML for insertion into a placeholder on the page.
       *
       * @private
       * @returns {string}                      Html string for insertion into placeholder.
       * @memberof PpmExtensionApplicationCustomizer
       */

      /*  private _getFooterHtml(): string {
        let year: number = new Date().getFullYear();
        const placeholderBody: string = `
          <footer>
            <span class=${styles.copyright}>
              &copy; Copyright ` + year + ` - UNCOMN | All Rights Reserved
            </span>
            <span class=${styles.websiteFeedback}>
          <DefaultButton onClick={(e)=>this._handleShowModal(e)}  text="Website Feedback" />
              <a href="https://msn.com">Website Feedback</a>
            </span>
          </footer>`;
      
        return placeholderBody;
      }
    */
   
    private _renderFeedbackFooter = () => {
     
      const element: React.ReactElement<IFeedbackFooterProps> = React.createElement(
        FeedbackFooter,
        {
          client: this.context.spHttpClient,
          webAbsoluteUrl: this._tenantURL,
        }
      );
  
      ReactDom.render(element, this._bottomPlaceholder.domElement);
    }
   
	private _windowBeforeUnload(e): void {
		try {
			this._bottomPlaceholder.dispose();

			if (window._cssLinkObserver) {
				window._cssLinkObserver.disconnect();
			}

			if (this.context && this.context.placeholderProvider) {
				this.context.placeholderProvider.changedEvent.remove(this, () => this.renderObserver(this));
				window.isChangedEventSubscribed = false;
			}

			this._renderFeedbackFooter();
		} catch (ex) {
			console.log('UncomnFooterApplicationCustomizer._windowBeforeUnload catch ', ex);
		}
	}
  }