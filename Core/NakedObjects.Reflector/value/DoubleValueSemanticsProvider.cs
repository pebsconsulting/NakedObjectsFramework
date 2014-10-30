// Copyright Naked Objects Group Ltd, 45 Station Road, Henley on Thames, UK, RG9 1AT
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and limitations under the License.

using System;
using System.Globalization;
using NakedObjects.Architecture;
using NakedObjects.Architecture.Adapter;
using NakedObjects.Architecture.Facet;
using NakedObjects.Architecture.Reflect;
using NakedObjects.Architecture.Spec;
using NakedObjects.Architecture.SpecImmutable;
using NakedObjects.Capabilities;
using NakedObjects.Core.Util;

namespace NakedObjects.Reflect.DotNet.Value {
    public class DoubleValueSemanticsProvider : ValueSemanticsProviderAbstract<double>, IPropertyDefaultFacet {
        private const double defaultValue = 0;
        private const bool equalByContent = true;
        private const bool immutable = true;
        private const int typicalLenth = 22;

        /// <summary>
        ///     Required because implementation of <see cref="IParser{T}" /> and <see cref="IEncoderDecoder{T}" />.
        /// </summary>
        public DoubleValueSemanticsProvider(IObjectSpecImmutable spec)
            : this(spec, null) {}

        public DoubleValueSemanticsProvider(IObjectSpecImmutable spec, ISpecification holder)
            : base(Type, holder, AdaptedType, typicalLenth, immutable, equalByContent, defaultValue, spec) {}

        private static Type Type {
            get { return typeof (IDoubleFloatingPointValueFacet); }
        }

        public static Type AdaptedType {
            get { return typeof (double); }
        }

        public object GetDefault(INakedObject inObject) {
            return defaultValue;
        }

        public static bool IsAdaptedType(Type type) {
            return type == typeof (double);
        }


        protected override double DoParse(string entry) {
            try {
                return double.Parse(entry);
            }
            catch (FormatException) {
                throw new InvalidEntryException(Resources.NakedObjects.NotANumber);
            }
            catch (OverflowException) {
                throw new InvalidEntryException(OutOfRangeMessage(entry, double.MinValue, double.MaxValue));
            }
        }

        protected override double DoParseInvariant(string entry) {
            return double.Parse(entry, CultureInfo.InvariantCulture);
        }

        protected override string GetInvariantString(double obj) {
            return obj.ToString(CultureInfo.InvariantCulture);
        }

        protected override string TitleStringWithMask(string mask, double value) {
            return value.ToString(mask);
        }

        protected override string DoEncode(double obj) {
            return obj.ToString("G");
        }

        protected override double DoRestore(string data) {
            return double.Parse(data);
        }

        public Double DoubleValue(INakedObject nakedObject) {
            return nakedObject.GetDomainObject<double>();
        }


        public override string ToString() {
            return "DoubleAdapter: ";
        }
    }
}