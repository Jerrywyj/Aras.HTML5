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
	'dojo/_base/array',
	'./_Grid',
	'dgrid/util/misc',
	'dijit/layout/BorderContainer',
	'./Control',
	'./Cells/Boolean',
	'./Cells/Date',
	'./Cells/Decimal',
	'./Cells/Float',
	'./Cells/Integer',
	'./Cells/Item',
	'./Cells/List',
	'./Cells/String',
	'./Cells/Text'
], function(declare, lang, array, _Grid, GridMisc, BorderContainer, Control, BooleanCell, DateCell, DecimalCell, FloatCell, IntegerCell, ItemCell, ListCell, StringCell, TextCell) {
	
	return declare('Aras.View.Grid', [BorderContainer, Control], {

		_rowsHandle: null,
		
		_columnsHandle: null,
		
		SelectedRows: null,
		
		baseClass: 'dijitContentPaneNoPadding',
		
		ShowHeader: null,
		
		constructor: function() {

		},
		
		startup: function() {
			this.inherited(arguments);
			
			// Call Control Startup
			this._startup();

			// Create Grid
			this._grid = new _Grid({ region: 'center', selectionMode: 'extended', showHeader: this.ShowHeader });
			this.addChild(this._grid);
		
			// Process Grid Select Event
			this._grid.on('dgrid-select', lang.hitch(this, function(event) {
				
				if ((this.ViewModel != null) && (this.ViewModel.Select.CanExecute))
				{					
					var Parameters = [];
				
					array.forEach(event.rows, function(row) {
						Parameters.push(this.ViewModel.Rows[row.data.id].ID);
					}, this);

					this.ViewModel.Select.Execute(Parameters);
				}
			}));
			
			// Process Grid Editor Show Event
			this._grid.on('dgrid-editor-show', lang.hitch(this, function(event) {
				
				if (this.ViewModel != null)
				{
					// Get Cell ViewModel
					var rowid = event.cell.row.id;
					var colname = event.cell.column.id;
					var rowviewmodel = this.ViewModel.Rows[rowid];
					var colindex = -1;
					
					for (var j=0; j<this.ViewModel.Columns.length; j++) 
					{
						if (this.ViewModel.Columns[j].Name == colname)
						{
							colindex = j;
							break;
						}
					}
					
					var cellviewmodel = this.ViewModel.Rows[rowid].Cells[colindex];
					
					// Set Editor ViewModel
					event.editor.set('ViewModel', cellviewmodel);
				}
				
			}));
			
			// Process Grid Editor Changed Event
			this._grid.on('dgrid-datachange', lang.hitch(this, function(event) {
				
				if (this.ViewModel != null)
				{
					// Get Cell ViewModel
					var rowid = event.cell.row.id;
					var colname = event.cell.column.id;
					var rowviewmodel = this.ViewModel.Rows[rowid];
					var colindex = -1;
					
					for (var j=0; j<this.ViewModel.Columns.length; j++) 
					{
						if (this.ViewModel.Columns[j].Name == colname)
						{
							colindex = j;
							break;
						}
					}
	
					var cellviewmodel = this.ViewModel.Rows[rowid].Cells[colindex];
								
					// Write New Value
					cellviewmodel.Write();
				}
				
			}));
			
			// Watch for Changes in Columns
			this._columnsHandle = this.ViewModel.watch("Columns", lang.hitch(this, this._updateColumns));
			
			// Watch for Changes in Rows
			this._rowsHandle = this.ViewModel.watch("Rows", lang.hitch(this, this._updateRows));
			
			// Update Rows
			this._updateColumns();	
		},
		
		destroy: function() {
			this.inherited(arguments);
			
			// Call Control Destroy
			this._destroy();
						
			if (this._rowsHandle)
			{
				this._rowsHandle.unwatch();
			}
			
			if (this._columnsHandle)
			{
				this._columnsHandle.unwatch();
			}
		},

		OnViewModelChanged: function(name, oldValue, newValue) {
			this.inherited(arguments);
			
			// Unwatch for changes in Columns
			if (this._columnsHandle)
			{
				this._columnsHandle.unwatch();
			}
			
			// Unwatch for Changes in Rows			
			if (this._rowsHandle)
			{
				this._rowsHandle.unwatch();
			}
			
			// Watch for Changes in Columns
			this._columnsHandle = this.ViewModel.watch("Columns", lang.hitch(this, this._updateColumns));
			
			// Watch for Changes in Rows
			this._rowsHandle = this.ViewModel.watch("Rows", lang.hitch(this, this._updateRows));
			
			// Update Columns
			this._updateColumns();	
		},
		
		_updateColumns: function() {
		
			// Create Columns
			var gridcolumns = {};
				
			array.forEach(this.ViewModel.Columns, function(columnviewmodel, i) {
	
				gridcolumns[columnviewmodel.Name] = {};
				gridcolumns[columnviewmodel.Name].label = columnviewmodel.Label;	
				gridcolumns[columnviewmodel.Name].sortable = false;
				gridcolumns[columnviewmodel.Name].editOn = 'click';
				gridcolumns[columnviewmodel.Name].dismissOnEnter = false;
				
				if (columnviewmodel.Editable)
				{
					switch(columnviewmodel.Type)
					{
						case "Aras.View.Columns.Boolean":
							gridcolumns[columnviewmodel.Name].editor = BooleanCell;
							break;

						case "Aras.View.Columns.Date":
							gridcolumns[columnviewmodel.Name].editor = DateCell;
							gridcolumns[columnviewmodel.Name].editorArgs = { style: 'width:' + (columnviewmodel.Width - 5) + 'px;' };
							break;
							
						case "Aras.View.Columns.Decimal":
							gridcolumns[columnviewmodel.Name].editor = DecimalCell;
							break;
	
						case "Aras.View.Columns.Float":
							gridcolumns[columnviewmodel.Name].editor = FloatCell;
							break;
							
						case "Aras.View.Columns.Integer":
							gridcolumns[columnviewmodel.Name].editor = IntegerCell;
							break;

						case "Aras.View.Columns.Item":
							gridcolumns[columnviewmodel.Name].editor = ItemCell;
							break;
	
						case "Aras.View.Columns.List":
							gridcolumns[columnviewmodel.Name].editor = ListCell;
							break;
	
						case "Aras.View.Columns.String":
							gridcolumns[columnviewmodel.Name].editor = StringCell;
							break;

						case "Aras.View.Columns.Text":
							gridcolumns[columnviewmodel.Name].editor = TextCell;
							break;
							
						default:
							gridcolumns[columnviewmodel.Name].editor = undefined;
							break;
					}
				}
				else
				{
					gridcolumns[columnviewmodel.Name].editor = undefined;
				}
				
				switch(columnviewmodel.Type)
				{
					case "Aras.View.Columns.Boolean":
						gridcolumns[columnviewmodel.Name].formatter = lang.hitch(this, this._formatBoolean);
						break;
						
					default:
					
						break;
				}
				
				// Set Column Width
				var rule = GridMisc.addCssRule('#' + GridMisc.escapeCssIdentifier(this._grid.domNode.id) +
						' .dgrid-column-' + GridMisc.escapeCssIdentifier(columnviewmodel.Name, '-'),
						'width: ' + columnviewmodel.Width + 'px;');
						
			}, this);
			
			// Set Grid Columns
			this._grid._setColumns(gridcolumns);

			// Update Rows
			this._updateRows();	
		},
		
		_updateRows: function() {
			
			// Render Grid
			var rowdata = [];
				
			array.forEach(this.ViewModel.Rows, function(rowviewmodel, i) {
					
				rowdata[i] = new Object();
				rowdata[i]['id'] = i;
						
				for (var j=0; j<this.ViewModel.Columns.length; j++) 
				{
					rowdata[i][this.ViewModel.Columns[j].Name] = rowviewmodel.Cells[j].Value;
				}
					
			}, this);
											
			// Clear Grid
			this._grid.refresh();
				
			// Render Grid
			this._grid.renderArray(rowdata);
		},
		
		_formatBoolean: function(value, object) {
			
			if (value == '1')
			{
				return '<input type="checkbox" disabled checked="checked">';
			}
			else
			{
				return '<input type="checkbox" disabled>';
			}
		}
		
	});
});