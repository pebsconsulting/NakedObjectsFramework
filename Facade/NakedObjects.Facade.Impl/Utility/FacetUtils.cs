﻿// Copyright Naked Objects Group Ltd, 45 Station Road, Henley on Thames, UK, RG9 1AT
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and limitations under the License.

using System;
using System.Text.RegularExpressions;
using NakedObjects.Architecture.Component;
using NakedObjects.Architecture.Facet;
using NakedObjects.Architecture.Spec;

namespace NakedObjects.Facade.Impl.Utility {
    public static class FacetUtils {
        public static string GetMaskedValue(this ISpecification spec, IObjectFacade objectFacade, INakedObjectManager nakedObjectManager) {
            if (objectFacade == null) {
                return null;
            }
            var mask = spec.GetFacet<IMaskFacet>();
            var no = ((ObjectFacade) objectFacade).WrappedNakedObject;
            return mask != null ? no.Spec.GetFacet<ITitleFacet>().GetTitleWithMask(mask.Value, no, nakedObjectManager) : no.TitleString();
        }

        public static int GetMemberOrder(this ISpecification spec) {
            var facet = spec.GetFacet<IMemberOrderFacet>();

            int result;
            if (facet != null && int.TryParse(facet.Sequence, out result)) {
                return result;
            }

            return 0;
        }

        public static string GetMask(this ISpecification spec) {
            var facet = spec.GetFacet<IMaskFacet>();
            return facet != null ? facet.Value : null;
        }

        public static int? GetMaxLength(this ISpecification spec) {
            var facet = spec.GetFacet<IMaxLengthFacet>();
            return facet != null ? (int?) facet.Value : null;
        }

        public static string GetPattern(this ISpecification spec) {
            var facet = spec.GetFacet<IRegExFacet>();
            return facet != null ? facet.Pattern.ToString() : null;
        }

        public static int GetAutoCompleteMinLength(this ISpecification spec) {
            var facet = spec.GetFacet<IAutoCompleteFacet>();
            return facet != null ? facet.MinLength : 0;
        }

        public static bool GetRenderEagerly(this ISpecification spec) {
            IEagerlyFacet eagerlyFacet = spec.GetFacet<IEagerlyFacet>();
            return eagerlyFacet != null && eagerlyFacet.What == EagerlyAttribute.Do.Rendering;
        }

        public static Tuple<bool, string[]> GetTableViewData(this ISpecification spec) {
            var facet = spec.GetFacet<ITableViewFacet>();
            return facet == null ? null : new Tuple<bool, string[]>(facet.Title, facet.Columns);
        }

        public static int GetNumberOfLinesWithDefault(this ISpecification spec) {
            var multiline = spec.GetFacet<IMultiLineFacet>();
            return multiline == null ? 1 : multiline.NumberOfLines;
        }

        public static int? GetNumberOfLines(this ISpecification spec) {
            var multiline = spec.GetFacet<IMultiLineFacet>();
            return multiline == null ? (int?)null : multiline.NumberOfLines;
        }

        public static int GetTypicalLength(this ISpecification spec) {
            var typicalLength = spec.GetFacet<ITypicalLengthFacet>();
            return typicalLength == null ? 0 : typicalLength.Value;
        }

        public static int GetWidth(this ISpecification spec) {
            var multiline = spec.GetFacet<IMultiLineFacet>();
            return multiline == null ? 0 : multiline.Width;
        }

        public static string GetPresentationHint(this ISpecification spec) {
            var hintFacet = spec.GetFacet<IPresentationHintFacet>();
            return hintFacet == null ? null : hintFacet.Value;
        }

        public static Tuple<Regex, string> GetRegEx(this ISpecification spec) {
            var regEx = spec.GetFacet<IRegExFacet>();
            return regEx == null ? null : new Tuple<Regex, string>(regEx.Pattern, regEx.FailureMessage);
        }

        public static Tuple<IConvertible, IConvertible, bool> GetRange(this ISpecification spec) {
            var rangeFacet = spec.GetFacet<IRangeFacet>();
            return rangeFacet == null ? null : new Tuple<IConvertible, IConvertible, bool>(rangeFacet.Min, rangeFacet.Max, rangeFacet.IsDateRange);
        }
    }
}