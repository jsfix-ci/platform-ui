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

import { shallow } from 'enzyme';
import { expect } from 'chai';
import { getDefaultRedirectPathForUser } from './index';
import { getPermissionsFromToken } from '../egoJwt';

/** has the following scopes:
 * "PROGRAMDATA-PACA-AU.WRITE"
 * "PROGRAMDATA-WP-CPMP-US.WRITE"
 **/
const DATA_SUBMITTER = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NjI2NzkyMDksImV4cCI6MjA2Mjc2NTYwOSwic3ViIjoiM2RjNjU5MmItMTQzNi00ZDVlLTk5MzEtMTRiZjFjZmVlZGU4IiwiaXNzIjoiZWdvIiwiYXVkIjpbXSwianRpIjoiZDUyZTFjOGYtYzVkYS00ZGRkLTgzODUtODI2OWM4NzcxYzhiIiwiY29udGV4dCI6eyJzY29wZSI6WyJQUk9HUkFNREFUQS1QQUNBLUFVLldSSVRFIiwiUFJPR1JBTS1QQUNBLUFVLlJFQUQiLCJQUk9HUkFNLVdQLUNQTVAtVVMuUkVBRCIsIlBST0dSQU1EQVRBLVdQLUNQTVAtVVMuV1JJVEUiXSwidXNlciI6eyJuYW1lIjoiYXJnby5kYXRhc3VibWl0dGVyQGdtYWlsLmNvbSIsImVtYWlsIjoiYXJnby5kYXRhc3VibWl0dGVyQGdtYWlsLmNvbSIsInN0YXR1cyI6IkFQUFJPVkVEIiwiZmlyc3ROYW1lIjoiRGFuIiwibGFzdE5hbWUiOiJEYXRhIFN1Ym1pdHR0ZXIiLCJjcmVhdGVkQXQiOjE1NjI2MjU2NDE4NjEsImxhc3RMb2dpbiI6MTU2MjY3OTIwOTA1MCwicHJlZmVycmVkTGFuZ3VhZ2UiOm51bGwsInR5cGUiOiJVU0VSIn19fQ.IUFWBUgpAN8s62Hemi8t6tfTCav_hHdy_uXxMmbVHzFrrcCSiFsRUs7cFSt5T0POiPCq6FxCxcWb9e2jgk_DGnMiZqjzfxNR47N4FAdJ6rVF4tfwRJNDF-Roa7W9tlll20dQmHdaKHDfjvBLWwL2Jr_n54W35Oo76cnzB84Ia5qK66k1_2snJcLB7c_6vpw3IYaoJYL4zsvBMYMdHeyNpJsOSPqUqdG1h6VKmAt3w7qQHAy2ESVWGhn3KCROEemfuPx3R3Ts8P39FZNxqbovwu4MAEbcaK6iRE0d8IOnXMCsZqmO0dAfZY4UUtwciwp3b9FiqHTprfBUs2w8fwxZJA`;

/** has the following scopes:
 * "PROGRAMDATA-PACA-AU.WRITE"
 * "PROGRAM-PACA-AU.WRITE"
 **/
const PROGRAM_ADMIN = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NjI2NzkzNjcsImV4cCI6MjA2Mjc2NTc2Nywic3ViIjoiMTYwZmZlYzctNDk0Zi00ZGU3LWFjMDItOGRlYjEwM2I3MDU3IiwiaXNzIjoiZWdvIiwiYXVkIjpbXSwianRpIjoiMmU3ZWZjY2QtZWNlMC00NTQ4LWE2MzAtMjA5ZDEyNDFmNDU5IiwiY29udGV4dCI6eyJzY29wZSI6WyJQUk9HUkFNREFUQS1QQUNBLUFVLldSSVRFIiwiUFJPR1JBTS1QQUNBLUFVLldSSVRFIl0sInVzZXIiOnsibmFtZSI6ImFyZ28ucHJvZ3JhbWFkQGdtYWlsLmNvbSIsImVtYWlsIjoiYXJnby5wcm9ncmFtYWRAZ21haWwuY29tIiwic3RhdHVzIjoiQVBQUk9WRUQiLCJmaXJzdE5hbWUiOiJQYXVsIiwibGFzdE5hbWUiOiJQcm9ncmFtIEFkbWluIiwiY3JlYXRlZEF0IjoxNTYyNjI1NjI4ODM4LCJsYXN0TG9naW4iOjE1NjI2NzkzNjc2MDYsInByZWZlcnJlZExhbmd1YWdlIjpudWxsLCJ0eXBlIjoiVVNFUiJ9fX0.tD1muPIhFNjD6OpMk9OG5-PAMVIMPAKerOYHXaNqmTcAcs-XaW_qMNZSnvDjqmLKse_gdQSQJVrRbXhpK_PhvWL6z_S7LIhA4EsDmKZEi8JbJz29K57Qp5gCI9qs2vOBD47hIS9XomGf5OUAcn8w_2xD7XNVSHnQP3PKmpdH5dCFpuyKbUsFupRUoJBuk0iltoxAs7uO2gKLnfFmUacd9592fAvidSAywu99T0kYGOGQBUNvBE68tngF_QIqlkVBMe0EbjQI8QkewuhrETZH3exWymg3J8E-uPNzuBpjEbwrdJm6kJUp1IGs65j9-SGLTTMfRCxEsBIW0v-6PqsiNQ`;

/** has the following scopes:
 * "score-argo-qa.WRITE"
 * "song-argo-qa.WRITE"
 * "PROGRAMSERVICE.WRITE"
 * "CLINICALSERVICE.WRITE"
 **/
const DCC_USER = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NjI2ODQ0NTgsImV4cCI6MjA2Mjc3MDg1OCwic3ViIjoiN2VlMWRkODctNTUzMC00MzA0LWIzYjItZTZiYzU5M2FmYjM3IiwiaXNzIjoiZWdvIiwiYXVkIjpbXSwianRpIjoiYWI0NTI0MjUtYjJiOC00MzExLWFmOTAtZGFkNzhjYjM0YTUzIiwiY29udGV4dCI6eyJzY29wZSI6WyJzY29yZS1hcmdvLXFhLldSSVRFIiwic29uZy1hcmdvLXFhLldSSVRFIiwiUFJPR1JBTVNFUlZJQ0UuV1JJVEUiLCJDTElOSUNBTFNFUlZJQ0UuV1JJVEUiXSwidXNlciI6eyJuYW1lIjoib2ljcnRlc3R1c2VyQGdtYWlsLmNvbSIsImVtYWlsIjoib2ljcnRlc3R1c2VyQGdtYWlsLmNvbSIsInN0YXR1cyI6IkFQUFJPVkVEIiwiZmlyc3ROYW1lIjoiT0lDUiIsImxhc3ROYW1lIjoiVGVzdGVyIiwiY3JlYXRlZEF0IjoxNTYyNjIzOTA4NTYzLCJsYXN0TG9naW4iOjE1NjI2ODQ0NTg0MDksInByZWZlcnJlZExhbmd1YWdlIjpudWxsLCJ0eXBlIjoiVVNFUiJ9fX0.rXQPLdJAis0EIWr_eZ_BG0WIZMFyKXsOGHLZz3_5MTFMp-YEy3_XaoBghJrp3C4uTjE7lrvv8XAo5IaL9W0uJnM0i31AsRQInmF1tjJOZ8w82oXxdqOvr5G-eRTPOtslFJarZI7AO18OAdkl5BPv_W-aGtFw--jMMt_DeJGUwbadXZwcbIjbX5fZNVwg6lo7wz0t4IH2e7ESxc_k8OF82j3XlflCoaigxu-77et2B_yzMJ_THWMts7E7JTog6b_fhQ2CiyzLdDogWotQtSWXhwgA-ugxxMDPdGRO1buqaAKeZguyQ9taUHYgH90HdIwCP9KCKqNt4v4Qvnk3IIqJeQ`;

const EXPIRED_TOKEN =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NjI2ODQ0NTgsImV4cCI6MTU2Mjc3MDg1OCwic3ViIjoiN2VlMWRkODctNTUzMC00MzA0LWIzYjItZTZiYzU5M2FmYjM3IiwiaXNzIjoiZWdvIiwiYXVkIjpbXSwianRpIjoiYWI0NTI0MjUtYjJiOC00MzExLWFmOTAtZGFkNzhjYjM0YTUzIiwiY29udGV4dCI6eyJzY29wZSI6WyJzY29yZS1hcmdvLXFhLldSSVRFIiwic29uZy1hcmdvLXFhLldSSVRFIiwiUFJPR1JBTVNFUlZJQ0UuV1JJVEUiXSwidXNlciI6eyJuYW1lIjoib2ljcnRlc3R1c2VyQGdtYWlsLmNvbSIsImVtYWlsIjoib2ljcnRlc3R1c2VyQGdtYWlsLmNvbSIsInN0YXR1cyI6IkFQUFJPVkVEIiwiZmlyc3ROYW1lIjoiT0lDUiIsImxhc3ROYW1lIjoiVGVzdGVyIiwiY3JlYXRlZEF0IjoxNTYyNjIzOTA4NTYzLCJsYXN0TG9naW4iOjE1NjI2ODQ0NTg0MDksInByZWZlcnJlZExhbmd1YWdlIjpudWxsLCJ0eXBlIjoiVVNFUiJ9fX0.QoG-V9409iN3_HD_dSDn6Pic2bLlp27x9BD5sBzr_n9IyUUaYO2ZatF_l-iaPD1FaYu_MxgN39SrvN5tbhpG4Ahl05w_G004RPbBAG7H-_2H2B5EgHnnHdYrThZuPuCj50_0__ZpRWpL2uh-0qHfPz7llAvaHzInAMxJiQ3gtQXdNOfaESrRFOC4gpqGzKmyG185e2iVL92_x4prznW0L13mBGh9Ox6Y4ec-rO5cy9RvORDmzMGa3yVoDKTt1CGtwvBgu7f_eiM3Za2q413kPMjyp_LAKuSH_-RPvKlL1BqRFumjkt3J7qOXrkD1xs9pH-t4QpAp5oRIy475uIKP4A';

const BOGUS_PROGRAM_ID = 'BOGUS_PROGRAM';

const dccPermissions = getPermissionsFromToken(DCC_USER);
const programAdminPermissions = getPermissionsFromToken(PROGRAM_ADMIN);
const dataSubmitterPermissions = getPermissionsFromToken(DATA_SUBMITTER);

describe('getDefaultRedirectPathForUser', () => {
  it('should return program list page for DCC', () => {
    expect(getDefaultRedirectPathForUser(dccPermissions)).to.equal('/submission/program');
  });
  it('should return the right program dashboard page for program admin', () => {
    expect(getDefaultRedirectPathForUser(programAdminPermissions)).to.equal(
      '/submission/program/PACA-AU/dashboard',
    );
  });
  it('should return the static program dashboard url for program admin', () => {
    expect(getDefaultRedirectPathForUser(programAdminPermissions, true)).to.equal(
      '/submission/program/[shortName]/dashboard',
    );
  });
  it('should return the right program dashboard page for data submitter', () => {
    expect(getDefaultRedirectPathForUser(dataSubmitterPermissions)).to.equal(
      '/submission/program/PACA-AU/dashboard',
    );
  });
  it('should return the static program dashboard url for data submitter', () => {
    expect(getDefaultRedirectPathForUser(dataSubmitterPermissions, true)).to.equal(
      '/submission/program/[shortName]/dashboard',
    );
  });
});
