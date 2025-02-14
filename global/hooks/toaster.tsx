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

import {
  NotificationInteraction,
  NotificationInteractionEvent,
  NotificationVariant,
  NOTIFICATION_INTERACTION_EVENTS,
} from '@icgc-argo/uikit/notifications/Notification';
import { TOAST_VARIANTS } from '@icgc-argo/uikit/notifications/Toast';
import omit from 'lodash/omit';
import * as React from 'react';

type ToastEventPayload = { type: NotificationInteractionEvent; event: any };
type ToastConfig = {
  variant?: NotificationVariant;
  interactionType?: NotificationInteraction;
  title: React.ReactNode;
  content: React.ReactNode;
  onInteraction?: (e: ToastEventPayload) => any;
};
export const useToastState = () => {
  const DEFAULT_TIMEOUT = 8000;
  const [toastStack, setToastStack] = React.useState<(ToastConfig & { id: string })[]>([]);

  const addToast = (toast: ToastConfig & { timeout?: number }) => {
    console.log(`🔥🍞🍞🍞🍞🍞🍞🔥`);
    console.log(`🔥🔥🔥🔥🔥🔥🔥🔥`);
    const id = String(Math.random());
    const DEFAULT_TOAST_CONFIGS: Partial<ToastConfig> = {
      variant: TOAST_VARIANTS.INFO as ToastConfig['variant'],
      onInteraction: (e) => e,
      interactionType: undefined, // the Toast component internally has its default, no need to cover this
    };
    setToastStack((toastStack) => [
      ...toastStack,
      { ...DEFAULT_TOAST_CONFIGS, ...omit(toast, 'timeout'), id },
    ]);
    if (toast.timeout !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, toast.timeout || DEFAULT_TIMEOUT);
    }
    return id;
  };

  const removeToast = (_id: string) => {
    setToastStack((toastStack) => toastStack.filter(({ id }) => id !== _id));
    return _id;
  };

  const onInteraction = ({ id: _id, payload }: { id: string; payload: ToastEventPayload }) => {
    if (
      [NOTIFICATION_INTERACTION_EVENTS.CLOSE, NOTIFICATION_INTERACTION_EVENTS.DISMISS].includes(
        payload.type,
      )
    ) {
      removeToast(_id);
    }
  };

  return {
    toastStack,
    addToast,
    removeToast,
    onInteraction,
  };
};
type Toaster = ReturnType<typeof useToastState>;

// @ts-ignore It's ok ts, we will make sure there's always a context
export const ToasterContext = React.createContext<Toaster>();
export const useToaster = () => React.useContext<Toaster>(ToasterContext);
