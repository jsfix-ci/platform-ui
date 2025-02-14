/*
 * Copyright (c) 2022 The Ontario Institute for Cancer Research. All rights reserved
 *
 * This program and the accompanying materials are made available under the terms of
 * the GNU Affero General Public License v3.0. You should have received a copy of the
 * GNU Affero General Public License along with this program.
 *  If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { Row, Col } from 'react-grid-system';
import styled from '@emotion/styled';
import { css } from '@emotion/core';
import FileSummary from './FileSummary';
import DataAndAnalysis from './DataAndAnalysis';
import AssociatedDonors from './AssociatedDonors';
import SequencingReadProperties from './SequencingReadProperties';
import { FileEntityData } from './types';

const PaddedRow = styled(Row)`
  padding-bottom: 8px;
`;

const PaddedColumn = styled(Col)`
  padding-bottom: 8px;
`;

const shouldShowSequencingReadProperties = (fileData: FileEntityData) => {
  return (
    fileData.dataAnalysis.dataType === 'Aligned Reads'
      && fileData.dataAnalysis.workflowType?.workflow_name === 'DNA Seq Alignment'
      && fileData.metrics
  );
};

const FileCardsLayout: React.ComponentType<{
  fileData: FileEntityData;
}> = ({ fileData }) => {
  return (
    <div
      css={css`
        margin: 0 5%;
      `}
    >
      <PaddedRow>
        <PaddedColumn md={6} sm={12}>
          <FileSummary data={fileData.summary} />
        </PaddedColumn>
        <PaddedColumn md={6} sm={12}>
          <DataAndAnalysis data={fileData.dataAnalysis} />
        </PaddedColumn>
      </PaddedRow>
      <PaddedRow>
        <PaddedColumn>
          <AssociatedDonors donors={fileData.donorRecords} />
        </PaddedColumn>
      </PaddedRow>
      {shouldShowSequencingReadProperties(fileData) && (
        <PaddedRow>
          <PaddedColumn>
            <SequencingReadProperties metrics={fileData.metrics} />
          </PaddedColumn>
        </PaddedRow>
      )}
    </div>
  );
};

export default FileCardsLayout;
