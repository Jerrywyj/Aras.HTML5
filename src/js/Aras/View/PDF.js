/*  
  Copyright 2017 Processwall Limited

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 
  Company: Processwall Limited
  Address: The Winnowing House, Mill Lane, Askham Richard, York, YO23 3NW, United Kingdom
  Tel:     +44 113 815 3440
  Web:     http://www.processwall.com
  Email:   support@processwall.com
*/

define([
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dijit/layout/ContentPane'
], function(declare, lang, ContentPane) {
	
	return declare('Aras.View.PDF', [ContentPane], {

		url: null,
		
		_urlHandle: null,
		
		_updateContent: function() {
			
			if (this.url != null)
			{
				this.set('content', '<object style="width: 100%; height: 100%" class="arasPDF" data="' + this.url + '" type="application/pdf"/>');
			}
			else
			{
				this.set('content', '');
			}
		},
		
		startup: function() {
			this.inherited(arguments);
			
			this._updateContent();
			
			this._urlHandle = this.watch('url', lang.hitch(this, function(name, oldval, newcal) {
				this._updateContent();
			}));
		}
		
		destroy: function() {
			this.inherited(arguments);
			
			if (this._urlHandle)
			{
				this._urlHandle.unwatch();
			}
		}
		
	});
});