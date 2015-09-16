/*
  Aras.HTML5 provides a HTML5 client library to build Aras Innovator Applications

  Copyright (C) 2015 Processwall Limited.

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with this program.  If not, see http://opensource.org/licenses/AGPL-3.0.
 
  Company: Processwall Limited
  Address: The Winnowing House, Mill Lane, Askham Richard, York, YO23 3NW, United Kingdom
  Tel:     +44 113 815 3440
  Email:   support@processwall.com
*/

define([
	'dojo/_base/declare',
	'dojo/request',
	'dojo/_base/lang',
	'dojo/_base/array',
	'dojo/json',
	'dojo/when',
	'./Control',
	'./Command'
], function(declare, request, lang, array, json, when, Control, Command) {
	
	return declare('Aras.ViewModel.Session', null, {
		
		Database: null, 
		
		Username: null,
		
		Password: null,
		
		_controlCache: new Object(),
		
		_commandCache: new Object(),
		
		constructor: function(args) {
			declare.safeMixin(this, args);
		},
		
		_processResponse: function(Response) {
			
			// Update Controls
			array.forEach(Response.ControlQueue, lang.hitch(this, function(control) {
				this.Control(control.ID).set('Data', control);
			}));
					
			// Update Commands
			array.forEach(Response.CommandQueue, lang.hitch(this, function(command) {
				this.Command(command.ID).set('Name', command.Name);
				this.Command(command.ID).set('CanExecute', command.CanExecute);
			}));	
		},
				
		Application: function(Name) {
				return request.put(this.Database.Server.URL + '/applications', 
							   { headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}, 
								 handleAs: 'json',
								 data: json.stringify({ Name: Name })
							   }).then(
				lang.hitch(this, function(result) {
					
					// Create Application
					var ret = this.Control(result.Value.ID).set('Data', result.Value);	
					
					// Process Response
					this._processResponse(result);
					
					return ret;
				})
			);
		},
		
		Plugin: function(Name, Context) {
				return request.put(this.Database.Server.URL + '/plugins', 
							   { headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}, 
								 handleAs: 'json',
								 data: json.stringify({ Name: Name, Context: Context })
							   }).then(
				lang.hitch(this, function(result) {
					
					// Create Plugin
					var ret = this.Control(result.Value.ID).set('Data', result.Value);	
					
					// Process Response
					this._processResponse(result);
					
					return ret;
				})
			);
		},
		
		_readControl: function(Control) {
		
			request.get(this.Database.Server.URL + '/controls/' + Control.ID, 
						{ headers: {'Accept': 'application/json'}, 
						  handleAs: 'json'
						}).then(lang.hitch(this, function(result) {
								   
				// Update Data on Control
				Control.set("Data", result.Value);
						
				// Process Response
				this._processResponse(result);
			}));	
		},
		
		Control: function(ID) {
			
			if (!this._controlCache[ID])
			{
				this._controlCache[ID] = new Control(this, ID);
				this._readControl(this._controlCache[ID]);
			}
	
			return this._controlCache[ID];
		},
			
		Command: function(ID) {
			
			if (!this._commandCache[ID])
			{
				this._commandCache[ID] = new Command(this, ID);
			}
	
			return this._commandCache[ID];
		},
		
		Execute: function(Command) {
			
			// Execute Command
			request.put(this.Database.Server.URL + '/commands/' + Command.ID + '/execute', 
								{ headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, 
								  handleAs: 'json'
								}).then(lang.hitch(this, function(response){
					this._processResponse(response);
				})
			);				
		},
		
		_writeControl: function(Control) {
			
			// Send to Server
			request.put(this.Database.Server.URL + '/controls/' + Control.ID, 
								{ headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, 
								  handleAs: 'json',
								  data: json.stringify(Control.Data)
								}).then(lang.hitch(this, function(response){
					this._processResponse(response);
				})
			);				
		}
		
	});
});