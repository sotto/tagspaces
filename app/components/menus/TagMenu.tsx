/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ShowEntriesWithTagIcon from '@material-ui/icons/Launch';
import Edit from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ConfirmDialog from '../dialogs/ConfirmDialog';
import EditTagDialog from '../dialogs/EditTagDialog';
import { Tag, TagGroup, Uuid } from '-/reducers/taglibrary';
import { actions as LocationIndexActions } from '-/reducers/location-index';
import i18n from '-/services/i18n';
import { SearchQuery } from '-/services/search';
import { getMaxSearchResults } from '-/reducers/settings';
import { actions as AppActions } from '-/reducers/app';

const isTagLibraryReadOnly =
  window.ExtTagLibrary && window.ExtTagLibrary.length > 0;

interface Props {
  anchorEl?: Element;
  open?: boolean;
  onClose: () => void;
  selectedTag?: Tag;
  selectedTagGroupEntry?: TagGroup;
  searchLocationIndex: (searchQuery: SearchQuery) => void;
  editTag: (tag: Tag, parentTagGroupUuid: Uuid, origTitle: string) => void;
  deleteTag: (tagTitle: string, parentTagGroupUuid: Uuid) => void;
  openSearchPanel: () => void;
  maxSearchResults: number;
}

const TagLibraryMenu = (props: Props) => {
  const [isEditTagDialogOpened, setIsEditTagDialogOpened] = useState(false);
  const [isDeleteTagDialogOpened, setIsDeleteTagDialogOpened] = useState(false);

  function showFilesWithThisTag() {
    if (props.selectedTag) {
      props.openSearchPanel();
      props.searchLocationIndex({
        tagsAND: [props.selectedTag],
        maxSearchResults: props.maxSearchResults
      });
    }
    props.onClose();
  }

  function showEditTagDialog() {
    props.onClose();
    setIsEditTagDialogOpened(true);
  }

  function showDeleteTagDialog() {
    props.onClose();
    setIsDeleteTagDialogOpened(true);
  }

  function handleCloseDialogs() {
    setIsEditTagDialogOpened(false);
    setIsDeleteTagDialogOpened(false);
  }

  function confirmDeleteTag() {
    if (props.selectedTag && props.selectedTagGroupEntry) {
      props.deleteTag(
        props.selectedTag.title,
        props.selectedTagGroupEntry.uuid
      );
    }
  }

  return (
    <div style={{ overflowY: 'hidden' }}>
      <Menu anchorEl={props.anchorEl} open={props.open} onClose={props.onClose}>
        <MenuItem
          data-tid="showFilesWithThisTag"
          onClick={showFilesWithThisTag}
        >
          <ListItemIcon>
            <ShowEntriesWithTagIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:showFilesWithThisTag')} />
        </MenuItem>
        {!isTagLibraryReadOnly && (
          <MenuItem data-tid="editTagDialog" onClick={showEditTagDialog}>
            <ListItemIcon>
              <Edit />
            </ListItemIcon>
            <ListItemText primary={i18n.t('core:editTag')} />
          </MenuItem>
        )}
        {!isTagLibraryReadOnly && (
          <MenuItem data-tid="deleteTagDialog" onClick={showDeleteTagDialog}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t('core:deleteTagFromTagGroup')} />
          </MenuItem>
        )}
      </Menu>
      <EditTagDialog
        open={isEditTagDialogOpened}
        onClose={handleCloseDialogs}
        editTag={props.editTag}
        selectedTagGroupEntry={props.selectedTagGroupEntry}
        selectedTag={props.selectedTag}
      />
      <ConfirmDialog
        open={isDeleteTagDialogOpened}
        onClose={handleCloseDialogs}
        title={i18n.t('core:deleteTagFromTagGroup')}
        content={i18n.t('core:deleteTagFromTagGroupContentConfirm', {
          tagName: props.selectedTag ? props.selectedTag.title : ''
        })}
        confirmCallback={result => {
          if (result) {
            confirmDeleteTag();
          }
        }}
        cancelDialogTID="cancelDeleteTagDialogTagMenu"
        confirmDialogTID="confirmDeleteTagDialogTagMenu"
      />
    </div>
  );
};

function mapStateToProps(state) {
  return {
    maxSearchResults: getMaxSearchResults(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      openSearchPanel: AppActions.openSearchPanel,
      searchLocationIndex: LocationIndexActions.searchLocationIndex
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(TagLibraryMenu);
