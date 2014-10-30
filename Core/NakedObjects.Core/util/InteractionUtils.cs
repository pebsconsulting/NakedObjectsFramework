// Copyright Naked Objects Group Ltd, 45 Station Road, Henley on Thames, UK, RG9 1AT
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and limitations under the License.

using System.Linq;
using NakedObjects.Architecture.Component;
using NakedObjects.Architecture.Facet;
using NakedObjects.Architecture.Interactions;
using NakedObjects.Architecture.Reflect;
using NakedObjects.Architecture.Spec;

namespace NakedObjects.Core.Util {
    public static class InteractionUtils {
        public static bool IsVisible(ISpecification specification, InteractionContext ic, ILifecycleManager persistor) {
            var buf = new InteractionBuffer();
            var facets = specification.GetFacets().Where(f => f is IHidingInteractionAdvisor).Cast<IHidingInteractionAdvisor>();
            foreach (IHidingInteractionAdvisor advisor in facets) {
                buf.Append(advisor.Hides(ic, persistor));
            }
            return IsVisible(buf);
        }

        public static bool IsVisibleWhenPersistent(ISpecification specification, InteractionContext ic, ILifecycleManager persistor) {
            var buf = new InteractionBuffer();
            var facets = specification.GetFacets().Where(f => f is IHidingInteractionAdvisor).Cast<IHidingInteractionAdvisor>();
            foreach (IHidingInteractionAdvisor advisor in facets) {
                if (advisor is IHiddenFacet) {
                    if (((IHiddenFacet) advisor).Value == WhenTo.OncePersisted) {
                        continue;
                    }
                }
                buf.Append(advisor.Hides(ic, persistor));
            }
            return IsVisible(buf);
        }

        private static bool IsVisible(InteractionBuffer buf) {
            return buf.IsEmpty;
        }

        public static IConsent IsUsable(ISpecification specification, InteractionContext ic) {
            InteractionBuffer buf = IsUsable(specification, ic, new InteractionBuffer());
            return IsUsable(buf);
        }

        private static InteractionBuffer IsUsable(ISpecification specification, InteractionContext ic, InteractionBuffer buf) {
            var facets = specification.GetFacets().Where(f => f is IDisablingInteractionAdvisor).Cast<IDisablingInteractionAdvisor>();
            foreach (IDisablingInteractionAdvisor advisor in facets) {
                buf.Append(advisor.Disables(ic));
            }
            return buf;
        }

        /// <summary>
        ///     To decode an <see cref="InteractionBuffer" /> returned by
        ///     <see
        ///         cref="IsUsable(ISpecification,InteractionContext,InteractionBuffer)" />
        /// </summary>
        private static IConsent IsUsable(InteractionBuffer buf) {
            return GetConsent(buf.ToString());
        }

        public static IConsent IsValid(ISpecification specification, InteractionContext ic) {
            InteractionBuffer buf = IsValid(specification, ic, new InteractionBuffer());
            return IsValid(buf);
        }

        public static InteractionBuffer IsValid(ISpecification specification, InteractionContext ic, InteractionBuffer buf) {
            var facets = specification.GetFacets().Where(f => f is IValidatingInteractionAdvisor).Cast<IValidatingInteractionAdvisor>();
            foreach (IValidatingInteractionAdvisor advisor in facets) {
                buf.Append(advisor.Invalidates(ic));
            }
            return buf;
        }

        /// <summary>
        ///     To decode an <see cref="InteractionBuffer" /> returned by
        ///     <see
        ///         cref="IsValid(ISpecification,InteractionContext,InteractionBuffer)" />
        /// </summary>
        public static IConsent IsValid(InteractionBuffer buf) {
            return GetConsent(buf.ToString());
        }


        private static IConsent GetConsent(string message) {
            if (string.IsNullOrEmpty(message)) {
                return Allow.Default;
            }
            return new Veto(message);
        }
    }


    // Copyright (c) Naked Objects Group Ltd.
}